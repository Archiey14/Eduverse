import dotenv from "dotenv";
dotenv.config();

const NODE_ENV = process.env.NODE_ENV || "development";

// Never fall back to a guessable JWT secret in production.
if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set when NODE_ENV=production");
}

export const ENV = {
  // Keep this in sync with VITE_API_URL in frontend/.env (default: 5001)
  PORT: process.env.PORT || 5001,
  NODE_ENV,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/eduverse",
  JWT_SECRET: process.env.JWT_SECRET || "eduverse_dev_only_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
};
