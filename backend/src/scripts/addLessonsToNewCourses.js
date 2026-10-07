import mongoose from "mongoose";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { ENV } from "../config/env.js";

const addLessonsToNewCourses = async () => {
  try {
    await mongoose.connect(ENV.MONGO_URI);
    console.log("[Script] Connected to MongoDB");

    const courses = await Course.find({ sections: { $size: 0 } });
    if (courses.length === 0) {
      console.log("[Script] No empty courses found.");
      process.exit(0);
    }

    console.log(`[Script] Found ${courses.length} courses without sections. Adding dummy lessons...`);

    for (const course of courses) {
      // Create sections
      course.sections = [
        { _id: new mongoose.Types.ObjectId(), title: "Introduction", order: 1 },
        { _id: new mongoose.Types.ObjectId(), title: "Core Concepts", order: 2 },
      ];
      await course.save();

      const sec1_id = course.sections[0]._id;
      const sec2_id = course.sections[1]._id;

      // Add lessons
      const lessons = [
        {
          course: course._id,
          sectionId: sec1_id,
          title: "Welcome to the Course",
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Safe placeholder video
          content: "Welcome to the course! In this video, we go over the full curriculum.",
          durationMin: 10,
          order: 1,
          isFreePreview: true,
          isPublished: true,
        },
        {
          course: course._id,
          sectionId: sec1_id,
          title: "Getting Started & Setup",
          type: "video",
          videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          content: "Let's set up our development environment.",
          durationMin: 15,
          order: 2,
          isFreePreview: false,
          isPublished: true,
        },
        {
          course: course._id,
          sectionId: sec2_id,
          title: "Deep Dive into Core Principles",
          type: "text",
          content: "Now we will understand the fundamental principles you need to succeed.",
          durationMin: 20,
          order: 1,
          isFreePreview: false,
          isPublished: true,
        },
      ];

      await Lesson.insertMany(lessons);
      console.log(`[Script] Added sections and lessons to ${course.title}`);
    }

    console.log("[Script] Finished successfully!");
    process.exit(0);
  } catch (err) {
    console.error("[Script] Error:", err);
    process.exit(1);
  }
};

addLessonsToNewCourses();
