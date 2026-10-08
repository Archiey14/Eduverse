import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";

// One shape for every response that returns the logged-in user, so the
// frontend never loses a field (e.g. createdAt) when it swaps the user object.
const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  roles: user.roles,
  avatarUrl: user.avatarUrl,
  mentorProfile: user.mentorProfile,
  createdAt: user.createdAt,
});

// Older accounts may not have a mentorProfile sub-document yet.
const ensureMentorProfile = (user) => {
  if (!user.mentorProfile) {
    user.mentorProfile = { headline: "", bio: "", expertise: [] };
  }
};

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new AppError(400, "Please provide name, email and password."));
  }

  if (password.length < 8) {
    return next(
      new AppError(400, "Password must be at least 8 characters long.")
    );
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return next(new AppError(409, "An account with this email already exists."));
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // New registrations always default to student role
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    roles: ["student"],
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: userPayload(user),
  });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError(400, "Please provide email and password."));
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
    "+passwordHash"
  );

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError(401, "Invalid email or password."));
  }

  if (!user.isActive) {
    return next(
      new AppError(401, "Your account is deactivated. Please contact support.")
    );
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userPayload(user),
  });
});

export const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    user: userPayload(req.user),
  });
});

export const becomeMentor = asyncHandler(async (req, res, next) => {
  const { headline, bio, expertise } = req.body;
  const user = await User.findById(req.user._id);

  if (!user.roles.includes("mentor")) {
    user.roles.push("mentor");
  }

  ensureMentorProfile(user);

  if (headline !== undefined) user.mentorProfile.headline = headline;
  if (bio !== undefined) user.mentorProfile.bio = bio;
  if (Array.isArray(expertise)) user.mentorProfile.expertise = expertise;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Mentor profile activated successfully",
    user: userPayload(user),
  });
});

export const updateMe = asyncHandler(async (req, res, next) => {
  const { name, avatarUrl, headline, bio, expertise } = req.body;
  const user = await User.findById(req.user._id);

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return next(new AppError(400, "Name cannot be empty."));
    }
    user.name = name.trim();
  }
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  if (headline !== undefined || bio !== undefined || expertise !== undefined) {
    ensureMentorProfile(user);
    if (headline !== undefined) user.mentorProfile.headline = headline;
    if (bio !== undefined) user.mentorProfile.bio = bio;
    if (Array.isArray(expertise)) user.mentorProfile.expertise = expertise;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: userPayload(user),
  });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(400, "Please provide both current and new password.")
    );
  }

  if (newPassword.length < 8) {
    return next(
      new AppError(400, "New password must be at least 8 characters long.")
    );
  }

  const user = await User.findById(req.user._id).select("+passwordHash");

  // Google-only accounts have no password to change
  if (!user.passwordHash) {
    return next(
      new AppError(
        400,
        "This account signs in with Google and has no password to change."
      )
    );
  }

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError(401, "Current password is incorrect."));
  }

  const salt = await bcrypt.genSalt(12);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password updated successfully.",
  });
});

export const googleAuth = asyncHandler(async (req, res, next) => {
  const { email, name, avatarUrl, googleId } = req.body;

  if (!email) {
    return next(new AppError(400, "Google account email is required."));
  }

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (user) {
    if (!user.isActive) {
      return next(
        new AppError(401, "Your account is deactivated. Please contact support.")
      );
    }

    let modified = false;
    if (googleId && !user.googleId) {
      user.googleId = googleId;
      modified = true;
    }
    if (avatarUrl && !user.avatarUrl) {
      user.avatarUrl = avatarUrl;
      modified = true;
    }
    if (modified) {
      await user.save();
    }
  } else {
    // Create new Google-authenticated user
    user = await User.create({
      name: name?.trim() || email.split("@")[0],
      email: normalizedEmail,
      avatarUrl: avatarUrl || "",
      googleId: googleId || "",
      authProvider: "google",
      roles: ["student"],
    });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Google sign-in successful",
    token,
    user: userPayload(user),
  });
});
