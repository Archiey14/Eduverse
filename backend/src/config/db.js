import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    console.error(
      "[MongoDB Error] Could not connect. If you use MongoDB Atlas, check that\n" +
        "  your current IP address is in the Atlas Network Access allow-list and\n" +
        "  that MONGO_URI in backend/.env is correct. For local development you\n" +
        "  can use: mongodb://localhost:27017/eduverse"
    );
    process.exit(1);
  }
};
