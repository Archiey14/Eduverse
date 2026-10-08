import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateToken } from "../utils/token.js";
import { sendEmail } from "../utils/sendEmail.js";

// One shape for every response that returns the logged-in user.
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
    user.mentorProfile = {
      headline: "",
      bio: "",
      expertise: [],
    };
  }
};

// ============================================================
// REGISTER
// ============================================================

export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(
      new AppError(400, "Please provide name, email and password.")
    );
  }

  if (password.length < 8) {
    return next(
      new AppError(400, "Password must be at least 8 characters long.")
    );
  }

  const existingUser = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (existingUser) {
    return next(
      new AppError(409, "An account with this email already exists.")
    );
  }

  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    roles: ["student"],
  });

  if (user.is2FAEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    console.log(
      `\n=========================================\n` +
        `[OTP GENERATED for ${user.email}]: ${otp}\n` +
        `=========================================\n`
    );

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Eduverse Verification Code",
        message: `Your One-Time Password is: ${otp}. It expires in 5 minutes.`,
        html: `<h2>Welcome to Eduverse!</h2>
          <p>Your One-Time Password is: <strong>${otp}</strong></p>
          <p>It expires in 5 minutes.</p>`,
      });
    } catch (err) {
      console.error(
        "Email sending failed (Check SMTP settings):",
        err.message
      );
    }

    return res.status(201).json({
      success: true,
      requires2FA: true,
      message: "Please verify your email with the OTP sent.",
      userId: user._id,
    });
  }

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    user: userPayload(user),
  });
});

// ============================================================
// LOGIN
// ============================================================

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(
      new AppError(400, "Please provide email and password.")
    );
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+passwordHash");

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError(401, "Invalid email or password."));
  }

  if (!user.isActive) {
    return next(
      new AppError(
        401,
        "Your account is deactivated. Please contact support."
      )
    );
  }

  if (user.is2FAEnabled) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otpCode = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    console.log(
      `\n=========================================\n` +
        `[OTP GENERATED for ${user.email}]: ${otp}\n` +
        `=========================================\n`
    );

    try {
      await sendEmail({
        email: user.email,
        subject: "Your Eduverse Login Code",
        message: `Your One-Time Password is: ${otp}. It expires in 5 minutes.`,
        html: `<h2>Login Attempt</h2>
          <p>Your One-Time Password is: <strong>${otp}</strong></p>
          <p>It expires in 5 minutes.</p>`,
      });
    } catch (err) {
      console.error(
        "Email sending failed (Check SMTP settings):",
        err.message
      );
    }

    return res.status(200).json({
      success: true,
      requires2FA: true,
      message:
        "OTP generated. Please check your email (or server logs for testing).",
      userId: user._id,
    });
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userPayload(user),
  });
});

// ============================================================
// VERIFY OTP
// ============================================================

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return next(new AppError(400, "Please provide userId and code."));
  }

  const user = await User.findById(userId).select(
    "+otpCode +otpExpiresAt"
  );

  if (!user || user.otpCode !== code) {
    return next(new AppError(401, "Invalid OTP code."));
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < Date.now()) {
    return next(
      new AppError(401, "OTP has expired. Please log in again.")
    );
  }

  user.otpCode = undefined;
  user.otpExpiresAt = undefined;

  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: userPayload(user),
  });
});

// ============================================================
// GET CURRENT USER
// ============================================================

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: userPayload(req.user),
  });
});

// ============================================================
// BECOME MENTOR
// ============================================================

export const becomeMentor = asyncHandler(async (req, res, next) => {
  const { headline, bio, expertise } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError(404, "User not found."));
  }

  if (!user.roles.includes("mentor")) {
    user.roles.push("mentor");
  }

  ensureMentorProfile(user);

  if (headline !== undefined) {
    user.mentorProfile.headline = headline;
  }

  if (bio !== undefined) {
    user.mentorProfile.bio = bio;
  }

  if (Array.isArray(expertise)) {
    user.mentorProfile.expertise = expertise;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Mentor profile activated successfully",
    user: userPayload(user),
  });
});

// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateMe = asyncHandler(async (req, res, next) => {
  const { name, avatarUrl, headline, bio, expertise } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError(404, "User not found."));
  }

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return next(new AppError(400, "Name cannot be empty."));
    }

    user.name = name.trim();
  }

  if (avatarUrl !== undefined) {
    user.avatarUrl = avatarUrl;
  }

  if (
    headline !== undefined ||
    bio !== undefined ||
    expertise !== undefined
  ) {
    ensureMentorProfile(user);

    if (headline !== undefined) {
      user.mentorProfile.headline = headline;
    }

    if (bio !== undefined) {
      user.mentorProfile.bio = bio;
    }

    if (Array.isArray(expertise)) {
      user.mentorProfile.expertise = expertise;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: userPayload(user),
  });
});

// ============================================================
// UPLOAD PROFILE PICTURE
// ============================================================

export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(
      new AppError(400, "Please select a profile picture.")
    );
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError(404, "User not found."));
  }

  const avatarUrl =
    `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  user.avatarUrl = avatarUrl;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile picture uploaded successfully.",
    user: userPayload(user),
  });
});

// ============================================================
// UPDATE PASSWORD
// ============================================================

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError(
        400,
        "Please provide both current and new password."
      )
    );
  }

  if (newPassword.length < 8) {
    return next(
      new AppError(
        400,
        "New password must be at least 8 characters long."
      )
    );
  }

  const user = await User.findById(req.user._id).select("+passwordHash");

  if (!user) {
    return next(new AppError(404, "User not found."));
  }

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

// ============================================================
// GOOGLE AUTHENTICATION
// ============================================================

export const googleAuth = asyncHandler(async (req, res, next) => {
  const { email, name, avatarUrl, googleId } = req.body;

  if (!email) {
    return next(
      new AppError(400, "Google account email is required.")
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  let user = await User.findOne({
    email: normalizedEmail,
  });

  if (user) {
    if (!user.isActive) {
      return next(
        new AppError(
          401,
          "Your account is deactivated. Please contact support."
        )
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