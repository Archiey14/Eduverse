import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { ENV } from "../config/env.js";

// The admin password is never hard-coded.
//   - Set ADMIN_PASSWORD in the environment to choose it, or
//   - leave it unset and a strong random password is generated and printed
//     ONCE when the account is created.
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@eduverse.com";

const seedAdmin = async () => {
  try {
    if (ENV.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
      console.error(
        "[Seed] In production you must set ADMIN_PASSWORD explicitly."
      );
      process.exit(1);
    }

    await mongoose.connect(ENV.MONGO_URI);
    console.log("[Seed] Connected to MongoDB");

    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
      console.log(`[Seed] Admin user (${ADMIN_EMAIL}) already exists.`);
      if (!existingAdmin.roles.includes("admin")) {
        existingAdmin.roles.push("admin");
        await existingAdmin.save();
        console.log("[Seed] Added admin role to existing user.");
      }
    } else {
      const generated = !process.env.ADMIN_PASSWORD;
      const password =
        process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString("base64url");

      if (password.length < 8) {
        console.error("[Seed] ADMIN_PASSWORD must be at least 8 characters.");
        process.exit(1);
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      await User.create({
        name: "Platform Administrator",
        email: ADMIN_EMAIL,
        passwordHash,
        roles: ["student", "mentor", "admin"],
        mentorProfile: {
          headline: "Head Administrator & Lead Educator",
          bio: "Managing the Eduverse platform operations and core curriculum.",
          expertise: ["System Architecture", "Curriculum Design"],
        },
      });

      console.log(`[Seed] Admin user created successfully:`);
      console.log(`       Email: ${ADMIN_EMAIL}`);
      if (generated) {
        console.log(`       Password: ${password}`);
        console.log("       (generated - save it now, it is not stored anywhere)");
      } else {
        console.log("       Password: (value of ADMIN_PASSWORD)");
      }
    }

    await mongoose.disconnect();
    console.log("[Seed] Done and disconnected.");
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] ${err.message}`);
    process.exit(1);
  }
};

seedAdmin();
