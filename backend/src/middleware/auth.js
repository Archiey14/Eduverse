import { verifyToken } from "../utils/token.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(401, "Not authorized to access this route. Please log in.")
    );
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return next(new AppError(401, "Token verification failed."));
  }

  // Role changes apply immediately because we read fresh user data on every request
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(401, "The user belonging to this token no longer exists.")
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError(401, "Your account has been deactivated. Please contact support.")
    );
  }

  req.user = currentUser;
  next();
});

// Like `protect`, but never rejects: attaches req.user when a valid token is
// supplied and simply continues as a guest otherwise.
export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (err) {
      // Ignore token failures for optional auth
    }
  }
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return next(new AppError(401, "Not authorized."));
    }

    const hasRole = roles.some((role) => req.user.roles.includes(role));
    if (!hasRole) {
      console.log(`[DEBUG] 403 Forbidden. User ID: ${req.user._id}, Email: ${req.user.email}, Roles: ${req.user.roles}`);
      return next(
        new AppError(
          403,
          `Access forbidden. Requires one of the following roles: [${roles.join(
            ", "
          )}]`
        )
      );
    }

    next();
  };
};
