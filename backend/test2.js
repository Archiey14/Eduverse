import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { User } from "./src/models/User.js";

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const user = await User.findOne({ name: "Archie Yadav" });
  console.log("Found user:", user.email, user._id);
  const token = generateToken(user._id);
  
  const res = await fetch("http://localhost:5001/api/auth/become-mentor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ headline: "New Instructor" })
  });
  
  const data = await res.json();
  console.log("Response:", res.status, data);
  process.exit(0);
});
