import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Course } from "../models/Course.js";
import { ENV } from "../config/env.js";
import { slugify } from "../utils/slugify.js";

const addMoreCourses = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("[Script] Connected to MongoDB");

    // Get an existing mentor or create one
    let mentor = await User.findOne({ roles: "mentor" });
    if (!mentor) {
      console.log("[Script] No mentor found, using admin...");
      mentor = await User.findOne({ roles: "admin" });
    }
    if (!mentor) {
      console.log("[Script] No users found. Skipping...");
      process.exit(0);
    }

    // Get categories
    let webCat = await Category.findOne({ slug: "web-development" });
    if (!webCat) {
      webCat = await Category.create({ name: "Web Development", slug: "web-development" });
    }
    
    let businessCat = await Category.findOne({ slug: "business" });
    if (!businessCat) {
      businessCat = await Category.create({ name: "Business", slug: "business" });
    }

    let mobileCat = await Category.findOne({ slug: "mobile-development" });
    if (!mobileCat) {
      mobileCat = await Category.create({ name: "Mobile Development", slug: "mobile-development" });
    }

    const coursesToAdd = [
      {
        mentor: mentor._id,
        title: "Mastering Node.js and Express",
        slug: slugify("Mastering Node.js and Express"),
        subtitle: "Build robust backend architectures with Node.js.",
        description: "Deep dive into building APIs, middleware, routing, and scalable backend applications.",
        category: webCat._id,
        level: "advanced",
        language: "English",
        thumbnailUrl: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&q=80&w=800",
        previewVideoUrl: "",
        learningOutcomes: ["Master REST APIs", "Understand Node Event Loop"],
        requirements: ["Basic JavaScript knowledge"],
        sections: [],
        status: "published",
        publishedAt: new Date(),
        stats: { ratingAvg: 4.8, ratingCount: 120, enrollmentCount: 850, lessonCount: 20, totalDurationMin: 600 }
      },
      {
        mentor: mentor._id,
        title: "Digital Marketing Masterclass",
        slug: slugify("Digital Marketing Masterclass"),
        subtitle: "Grow your brand with modern digital marketing strategies.",
        description: "Learn SEO, Social Media Marketing, Email Marketing, and more.",
        category: businessCat._id,
        level: "beginner",
        language: "English",
        thumbnailUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&q=80&w=800",
        previewVideoUrl: "",
        learningOutcomes: ["SEO Optimization", "Social Media Advertising"],
        requirements: ["None"],
        sections: [],
        status: "published",
        publishedAt: new Date(),
        stats: { ratingAvg: 4.6, ratingCount: 300, enrollmentCount: 2200, lessonCount: 15, totalDurationMin: 400 }
      },
      {
        mentor: mentor._id,
        title: "Flutter for Beginners",
        slug: slugify("Flutter for Beginners"),
        subtitle: "Build cross-platform mobile apps.",
        description: "Learn Dart and Flutter to create beautiful apps for iOS and Android.",
        category: mobileCat._id,
        level: "beginner",
        language: "English",
        thumbnailUrl: "https://images.unsplash.com/photo-1617042375876-a13e36732a92?auto=format&fit=crop&q=80&w=800",
        previewVideoUrl: "",
        learningOutcomes: ["Build iOS and Android apps", "Master Dart programming"],
        requirements: ["Basic programming concepts"],
        sections: [],
        status: "published",
        publishedAt: new Date(),
        stats: { ratingAvg: 4.9, ratingCount: 450, enrollmentCount: 3100, lessonCount: 30, totalDurationMin: 900 }
      },
      {
        mentor: mentor._id,
        title: "Advanced CSS and Sass",
        slug: slugify("Advanced CSS and Sass"),
        subtitle: "Take your CSS skills to the next level.",
        description: "Learn Flexbox, Grid, Animations, and Sass to create stunning layouts.",
        category: webCat._id,
        level: "intermediate",
        language: "English",
        thumbnailUrl: "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&q=80&w=800",
        previewVideoUrl: "",
        learningOutcomes: ["Master CSS Grid & Flexbox", "Write modular Sass"],
        requirements: ["HTML & CSS basics"],
        sections: [],
        status: "published",
        publishedAt: new Date(),
        stats: { ratingAvg: 4.7, ratingCount: 210, enrollmentCount: 1500, lessonCount: 25, totalDurationMin: 550 }
      },
      {
        mentor: mentor._id,
        title: "Entrepreneurship 101",
        slug: slugify("Entrepreneurship 101"),
        subtitle: "Start your own successful business.",
        description: "Learn how to validate ideas, raise capital, and launch your startup.",
        category: businessCat._id,
        level: "beginner",
        language: "English",
        thumbnailUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
        previewVideoUrl: "",
        learningOutcomes: ["Validate startup ideas", "Create business models"],
        requirements: ["None"],
        sections: [],
        status: "published",
        publishedAt: new Date(),
        stats: { ratingAvg: 4.5, ratingCount: 89, enrollmentCount: 600, lessonCount: 12, totalDurationMin: 320 }
      }
    ];

    console.log("[Script] Inserting new courses...");
    await Course.insertMany(coursesToAdd);
    console.log("[Script] Successfully added new courses!");
    process.exit(0);
  } catch (error) {
    console.error("[Script] Error:", error);
    process.exit(1);
  }
};

addMoreCourses();
