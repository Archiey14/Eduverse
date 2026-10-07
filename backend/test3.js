import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./src/models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const users = await User.find();
  let errors = 0;
  for (const user of users) {
    try {
      if (!user.roles.includes("mentor")) user.roles.push("mentor");
      if (!user.mentorProfile) user.mentorProfile = { headline: "", bio: "", expertise: [] };
      user.mentorProfile.headline = "New Instructor";
      await user.save();
    } catch (err) {
      console.error("Error saving user:", user.email, err.message);
      errors++;
    }
  }
  console.log(`Processed ${users.length} users. Errors: ${errors}`);
  process.exit(0);
});
