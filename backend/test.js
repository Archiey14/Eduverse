import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find().sort({ updatedAt: -1 }).limit(3);
  for (const user of users) {
    console.log("Found user:", user.email, user.name);
    try {
      if (!user.roles.includes("mentor")) {
        user.roles.push("mentor");
      }
      if (!user.mentorProfile) {
        user.mentorProfile = { headline: "", bio: "", expertise: [] };
      }
      user.mentorProfile.headline = "New Instructor";
      await user.save();
      console.log("  -> Saved successfully");
    } catch (err) {
      console.error("  -> Error saving:", err.message);
    }
  }
  process.exit(0);
});
