import { AppError } from "../utils/AppError.js";

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === "CastError") {
    const message = `Invalid ${err.path}: ${err.value}`;
    error = new AppError(400, message);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new AppError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors || {}).map((el) => el.message);
    const message = `Validation error: ${errors.join(", ")}`;
    error = new AppError(400, message, errors);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError(401, "Invalid authentication token. Please log in again.");
  }

  if (err.name === "TokenExpiredError") {
    error = new AppError(401, "Your session has expired. Please log in again.");
  }

  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || "Internal server error",
  };

  if (error.errors) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV === "development" && !error.isOperational) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
