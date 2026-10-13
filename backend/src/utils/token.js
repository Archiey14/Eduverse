import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateToken = (userId, sessionId = null) => {
  const payload = { id: userId };
  if (sessionId) {
    payload.sessionId = String(sessionId);
  }
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, ENV.JWT_SECRET);
};
