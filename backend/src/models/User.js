import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const mentorProfileSchema = new mongoose.Schema(
  {
    headline: { type: String, trim: true, default: "" },
    bio: { type: String, trim: true, default: "" },
    expertise: [{ type: String, trim: true }],
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      default: "",
    },
    roles: {
      type: [String],
      enum: ["student", "mentor", "admin"],
      default: ["student"],
    },
    mentorProfile: {
      type: mentorProfileSchema,
      default: () => ({ headline: "", bio: "", expertise: [] }),
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    is2FAEnabled: {
      type: Boolean,
      default: true,
    },
    otpCode: {
      type: String,
      select: false,
    },
    otpExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);
