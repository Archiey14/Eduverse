import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Quiz } from "../models/Quiz.js";
import { Enrollment } from "../models/Enrollment.js";
import { Review } from "../models/Review.js";
import { Activity } from "../models/Activity.js";
import { Notification } from "../models/Notification.js";
import { ENV } from "../config/env.js";
import { slugify } from "../utils/slugify.js";

// ---------------------------------------------------------------------------
// Safety guard: this script WIPES users, courses, enrollments and more.
// It only runs automatically against a local MongoDB. To run it against any
// other database (e.g. Atlas) you must pass --force explicitly, and it will
// never run when NODE_ENV=production.
// ---------------------------------------------------------------------------
const isLocalDb = (uri) =>
  /^mongodb:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(uri || "");

const assertSafeToSeed = () => {
  if (ENV.NODE_ENV === "production") {
    console.error("[Seed] Refusing to run: NODE_ENV is 'production'.");
    process.exit(1);
  }

  if (!isLocalDb(ENV.MONGO_URI) && !process.argv.includes("--force")) {
    console.error(
      "[Seed] Refusing to run: MONGO_URI does not point at a local database.\n" +
        "       This script DELETES all users, courses, lessons, quizzes, enrollments,\n" +
        "       reviews, activities and notifications.\n" +
        "       If you really want to wipe the configured database, re-run with:\n" +
        "         npm run seed:demo -- --force"
    );
    process.exit(1);
  }
};

// Demo password comes from the environment so it is never a hard-coded secret
// on a shared database. Falls back to a local-only default.
const DEMO_PASSWORD = process.env.SEED_PASSWORD || "Password@123";

const seedDemoData = async () => {
  try {
    assertSafeToSeed();

    await mongoose.connect(ENV.MONGO_URI);
    console.log("[Seed] Connected to MongoDB");

    // Clean existing collections
    console.log("[Seed] Cleaning existing demo collections...");
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Enrollment.deleteMany({}),
      Review.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // 1. Create Users
    console.log("[Seed] Creating users...");
    const salt = await bcrypt.genSalt(12);
    const defaultPasswordHash = await bcrypt.hash(DEMO_PASSWORD, salt);

    const admin = await User.create({
      name: "Archie Yadav",
      email: "admin@eduverse.com",
      passwordHash: defaultPasswordHash,
      roles: ["student", "mentor", "admin"],
      mentorProfile: {
        headline: "Principal Software Architect",
        bio: "Full stack engineer and educator building the future of web learning.",
        expertise: ["Node.js", "React", "Distributed Systems"],
      },
    });

    const mentorSarah = await User.create({
      name: "Sarah Johnson",
      email: "sarah@eduverse.com",
      passwordHash: defaultPasswordHash,
      roles: ["student", "mentor"],
      mentorProfile: {
        headline: "Senior Frontend Engineer & React Specialist",
        bio: "10+ years teaching frontend web development, TypeScript, and modern state architectures.",
        expertise: ["React", "TypeScript", "Next.js", "CSS Architecture"],
      },
    });

    const mentorDavid = await User.create({
      name: "David Wilson",
      email: "david@eduverse.com",
      passwordHash: defaultPasswordHash,
      roles: ["student", "mentor"],
      mentorProfile: {
        headline: "Staff Data Scientist & AI Educator",
        bio: "Machine learning practitioner specializing in Python, data analysis pipelines, and neural networks.",
        expertise: ["Python", "Machine Learning", "Pandas", "PyTorch"],
      },
    });

    const studentAlex = await User.create({
      name: "Alex Rivera",
      email: "student@eduverse.com",
      passwordHash: defaultPasswordHash,
      roles: ["student"],
    });

    // 2. Create Categories
    console.log("[Seed] Creating categories...");
    const catWeb = await Category.create({
      name: "Web Development",
      slug: "web-development",
      description: "Full-stack, frontend, and backend web engineering tracks.",
    });

    const catData = await Category.create({
      name: "Data Science",
      slug: "data-science",
      description: "Data analysis, machine learning, Python, and AI engineering.",
    });

    const catDesign = await Category.create({
      name: "UI/UX Design",
      slug: "ui-ux-design",
      description: "Product design, user research, wireframing, and Figma mastery.",
    });

    // 3. Create Course 1: React & TypeScript
    console.log("[Seed] Creating Course 1 (React & TypeScript)...");
    const course1 = await Course.create({
      mentor: mentorSarah._id,
      title: "Complete React & TypeScript Development",
      slug: slugify("Complete React & TypeScript Development"),
      subtitle: "Build modern, scalable web applications using React and TypeScript from ground up.",
      description:
        "Master modern React 19, TypeScript fundamentals, state management patterns, performant rendering, custom hooks, and full-stack integration with REST APIs.",
      category: catWeb._id,
      level: "intermediate",
      language: "English",
      thumbnailUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
      previewVideoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      learningOutcomes: [
        "Master React 19 core mental models and state reactivity",
        "Write robust, strictly-typed code with TypeScript interfaces and generics",
        "Build full-featured component design systems from scratch",
        "Connect frontends with REST APIs and handle complex loading and error states",
      ],
      requirements: [
        "Basic knowledge of HTML, CSS, and modern JavaScript (ES6+)",
        "A code editor like VS Code installed on your machine",
      ],
      sections: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Section 1: Getting Started with React & TypeScript",
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Section 2: Component Architecture & State Management",
          order: 2,
        },
      ],
      status: "published",
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    });

    const sec1_1 = course1.sections[0]._id;
    const sec1_2 = course1.sections[1]._id;

    // Lessons for Course 1
    const l1_1 = await Lesson.create({
      course: course1._id,
      sectionId: sec1_1,
      title: "Introduction to React 19 & Course Overview",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      content: "Welcome to the course! In this video, we go over the full curriculum roadmap and modern React 19 features.",
      durationMin: 12,
      order: 1,
      isFreePreview: true,
      isPublished: true,
    });

    const l1_2 = await Lesson.create({
      course: course1._id,
      sectionId: sec1_1,
      title: "TypeScript Setup & React Props Typing",
      type: "video",
      videoUrl: "https://www.youtube.com/watch?v=bMknfKXIFA8",
      content: "Learn how to configure `tsconfig.json` and declare strong TypeScript interfaces for component props.",
      durationMin: 22,
      order: 2,
      isFreePreview: false,
      isPublished: true,
    });

    const l1_3 = await Lesson.create({
      course: course1._id,
      sectionId: sec1_2,
      title: "Custom Hooks & Asynchronous State Flow",
      type: "text",
      videoUrl: "",
      content: "Deep dive into creating reusable custom hooks for API polling, local storage syncing, and debounce operations.",
      durationMin: 25,
      order: 3,
      isFreePreview: false,
      isPublished: true,
    });

    // Quiz for Course 1
    const quiz1 = await Quiz.create({
      course: course1._id,
      sectionId: sec1_2,
      title: "React & TypeScript Fundamentals Quiz",
      instructions: "Test your understanding of props typing, hooks lifecycle, and React components.",
      passPercent: 70,
      maxAttempts: 3,
      isRequired: true,
      isPublished: true,
      questions: [
        {
          text: "Which TypeScript utility type makes all properties of an interface optional?",
          options: ["Required<T>", "Partial<T>", "Readonly<T>", "Record<K, T>"],
          correctIndex: 1,
          explanation: "Partial<T> returns a type with all properties of T set to optional.",
        },
        {
          text: "What is the primary benefit of custom React hooks?",
          options: [
            "To replace CSS styling",
            "To encapsulate and reuse stateful logic across components",
            "To speed up browser rendering engine",
            "To bypass TypeScript type checker",
          ],
          correctIndex: 1,
          explanation: "Custom hooks allow extracting stateful component logic into reusable functions.",
        },
      ],
    });

    // 4. Create Course 2: Python for Data Science
    console.log("[Seed] Creating Course 2 (Python for Data Science)...");
    const course2 = await Course.create({
      mentor: mentorDavid._id,
      title: "Python for Data Science & Machine Learning",
      slug: slugify("Python for Data Science & Machine Learning"),
      subtitle: "Learn Python data analysis, NumPy, Pandas, Data Visualization, and Scikit-Learn.",
      description:
        "Comprehensive hands-on course taking you from Python syntax basics to exploratory data analysis, data wrangling, and predictive modeling.",
      category: catData._id,
      level: "beginner",
      language: "English",
      thumbnailUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
      previewVideoUrl: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
      learningOutcomes: [
        "Master data analysis with Pandas dataframes",
        "Perform fast numerical computing with NumPy arrays",
        "Create rich interactive charts with Matplotlib and Seaborn",
        "Train baseline supervised machine learning models",
      ],
      requirements: ["No prior programming experience required."],
      sections: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Section 1: Python Fundamentals",
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: "Section 2: Data Wrangling with Pandas",
          order: 2,
        },
      ],
      status: "published",
      publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    });

    const sec2_1 = course2.sections[0]._id;
    const sec2_2 = course2.sections[1]._id;

    await Lesson.create([
      {
        course: course2._id,
        sectionId: sec2_1,
        title: "Python Data Types, Lists, and Dicts",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
        content: "Understanding native Python data structures and operations.",
        durationMin: 18,
        order: 1,
        isFreePreview: true,
        isPublished: true,
      },
      {
        course: course2._id,
        sectionId: sec2_1,
        title: "Functions, Loops, and Comprehensions",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
        content: "Writing clean, functional Python code with list comprehensions.",
        durationMin: 20,
        order: 2,
        isFreePreview: false,
        isPublished: true,
      },
      {
        course: course2._id,
        sectionId: sec2_2,
        title: "Introduction to Pandas DataFrames",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
        content: "Loading datasets, filtering rows, grouping, and aggregations.",
        durationMin: 35,
        order: 3,
        isFreePreview: false,
        isPublished: true,
      },
    ]);

    // Update stats for both courses
    course1.stats = {
      lessonCount: 3,
      quizCount: 1,
      totalDurationMin: 59,
      enrollmentCount: 1,
      ratingAvg: 4.9,
      ratingCount: 1,
    };
    await course1.save();

    course2.stats = {
      lessonCount: 3,
      quizCount: 0,
      totalDurationMin: 73,
      enrollmentCount: 1,
      ratingAvg: 4.8,
      ratingCount: 1,
    };
    await course2.save();

    // 5. Create Enrollment & Progress for Student Alex
    console.log("[Seed] Creating sample enrollment & progress...");
    await Enrollment.create({
      student: studentAlex._id,
      course: course1._id,
      status: "active",
      enrolledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedLessons: [l1_1._id, l1_2._id],
      passedQuizzes: [quiz1._id],
      lastLesson: l1_2._id,
      progressPercent: 75,
    });

    await Enrollment.create({
      student: studentAlex._id,
      course: course2._id,
      status: "active",
      enrolledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedLessons: [],
      passedQuizzes: [],
      progressPercent: 0,
    });

    // 6. Create Reviews
    console.log("[Seed] Creating sample reviews...");
    await Review.create({
      course: course1._id,
      student: studentAlex._id,
      rating: 5,
      comment:
        "The React 19 explanations and TypeScript best practices were crystal clear. Highly recommend this course!",
      mentorReply: {
        text: "Thank you Alex! Really glad the TypeScript mental models helped you.",
        repliedAt: new Date(),
      },
    });

    // 7. Create Activities & Notifications
    console.log("[Seed] Creating activities and notifications...");
    await Activity.create([
      {
        user: studentAlex._id,
        type: "enrolled",
        course: course1._id,
        message: `Enrolled in "${course1.title}"`,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: studentAlex._id,
        type: "lesson_completed",
        course: course1._id,
        refId: l1_1._id,
        message: `Completed lesson "${l1_1.title}"`,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        user: studentAlex._id,
        type: "quiz_passed",
        course: course1._id,
        refId: quiz1._id,
        message: `Passed quiz "${quiz1.title}" with 100%`,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    await Notification.create([
      {
        user: studentAlex._id,
        type: "welcome",
        message: "Welcome to Eduverse! Start your learning journey by exploring our courses.",
        isRead: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        user: studentAlex._id,
        type: "quiz_result",
        message: `You passed "${quiz1.title}" with a perfect score!`,
        course: course1._id,
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    console.log("\n========================================================");
    console.log(" Demo Data Seeded Successfully!");
    console.log("========================================================");
    console.log(" Accounts created:");
    console.log("   Admin:   admin@eduverse.com");
    console.log("   Mentor:  sarah@eduverse.com");
    console.log("   Mentor:  david@eduverse.com");
    console.log("   Student: student@eduverse.com");
    console.log(
      process.env.SEED_PASSWORD
        ? "   Password: (value of SEED_PASSWORD)"
        : "   Password: Password@123  (local default - set SEED_PASSWORD to change)"
    );
    console.log("========================================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(`[Seed Error] ${err.message}`);
    process.exit(1);
  }
};

seedDemoData();
