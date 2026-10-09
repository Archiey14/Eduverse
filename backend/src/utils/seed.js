import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Import Models
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Course } from "../models/Course.js";
import { Lesson } from "../models/Lesson.js";
import { Enrollment } from "../models/Enrollment.js";

// Load environment variables (to connect to DB)
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  console.log("🧹 Dropping existing database collections...");
  await User.deleteMany({});
  await Category.deleteMany({});
  await Course.deleteMany({});
  await Lesson.deleteMany({});
  await Enrollment.deleteMany({});
  console.log("✅ Database wiped clean.\n");

  console.log("🌱 Injecting fresh synthetic data...");

  // 1. Create Default Admin & Testing Users
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const admin = await User.create({
    name: "System Admin",
    email: "admin@eduverse.com",
    passwordHash,
    roles: ["admin"],
    avatarUrl: faker.image.avatar(),
  });

  const testStudent = await User.create({
    name: "Test Student",
    email: "student@eduverse.com",
    passwordHash,
    roles: ["student"],
    avatarUrl: faker.image.avatar(),
  });

  const testMentor = await User.create({
    name: "Test Instructor",
    email: "instructor@eduverse.com",
    passwordHash,
    roles: ["mentor"],
    avatarUrl: faker.image.avatar(),
    mentorProfile: {
      headline: "Senior Software Engineer",
      bio: "10+ years of experience building scalable applications.",
      expertise: ["Web Development", "AI"],
    },
  });

  // 2. Generate Random Instructors
  const instructors = [];
  for (let i = 0; i < 5; i++) {
    instructors.push(
      await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        roles: ["mentor"],
        avatarUrl: faker.image.avatar(),
        mentorProfile: {
          headline: faker.person.jobTitle(),
          bio: faker.lorem.paragraph(),
          expertise: [faker.company.buzzAdjective(), faker.company.buzzNoun()],
        },
      })
    );
  }
  instructors.push(testMentor);

  // 3. Generate Random Students
  const students = [];
  for (let i = 0; i < 50; i++) {
    students.push(
      await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        passwordHash,
        roles: ["student"],
        avatarUrl: faker.image.avatar(),
      })
    );
  }
  students.push(testStudent);

  console.log(`✅ Created ${instructors.length} instructors and ${students.length} students.`);

  // 4. Create Categories
  const categoryNames = ["Web Development", "Data Science", "Design", "Business", "Marketing"];
  const categories = [];
  for (let name of categoryNames) {
    categories.push(
      await Category.create({
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        description: faker.lorem.sentence(),
        icon: "💻",
      })
    );
  }
  console.log(`✅ Created ${categories.length} categories.`);

  // 5. Create Courses & Lessons
  const courses = [];
  for (let i = 0; i < 15; i++) {
    console.log(`Starting course ${i+1}...`);
    const title = faker.company.catchPhrase();
    const course = await Course.create({
      mentor: faker.helpers.arrayElement(instructors)._id,
      title,
      slug: faker.helpers.slugify(title).toLowerCase() + "-" + faker.string.alphanumeric(4),
      subtitle: faker.lorem.sentence(),
      description: faker.lorem.paragraphs(3),
      category: faker.helpers.arrayElement(categories)._id,
      level: faker.helpers.arrayElement(["beginner", "intermediate", "advanced"]),
      language: "English",
      thumbnailUrl: faker.image.url(),
      status: "published",
      learningOutcomes: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
      requirements: [faker.lorem.sentence()],
      sections: [
        { title: "Introduction", order: 1 },
        { title: "Main Concepts", order: 2 },
      ]
    });
    console.log(`Created course ${i+1}`);

    const section1Id = course.sections[0]._id;
    const section2Id = course.sections[1]._id;

    // Create 5-10 Lessons for this course
    let totalDurationMin = 0;
    const numLessons = faker.number.int({ min: 5, max: 10 });
    for (let j = 1; j <= numLessons; j++) {
      const durationMin = faker.number.int({ min: 5, max: 30 });
      totalDurationMin += durationMin;
      await Lesson.create({
        course: course._id,
        sectionId: j <= numLessons / 2 ? section1Id : section2Id,
        title: `Lesson ${j}: ${faker.company.catchPhrase()}`,
        description: faker.lorem.paragraph(),
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", // generic valid video link
        durationMin,
        order: j,
        isFreePreview: j === 1,
      });
    }

    // Update course stats
    course.stats.lessonCount = numLessons;
    course.stats.totalDurationMin = totalDurationMin;
    await course.save();
    courses.push(course);
  }
  console.log(`✅ Created ${courses.length} courses with lessons.`);

  // 6. Create Enrollments (Analytics Data)
  let enrollmentCount = 0;
  for (const student of students) {
    try {
      // Enroll each student in 1 to 4 random courses
      const numEnrollments = faker.number.int({ min: 1, max: 4 });
      const enrolledCourses = faker.helpers.arrayElements(courses, numEnrollments);

      for (const course of enrolledCourses) {
        await Enrollment.create({
          student: student._id,
          course: course._id,
          status: "active",
          progressPercent: faker.number.int({ min: 0, max: 100 }),
        });
        enrollmentCount++;
        
        // Update course enrollment count
        await Course.findByIdAndUpdate(course._id, {
          $inc: { "stats.enrollmentCount": 1 }
        });
      }
    } catch (err) {
      console.error("Error creating enrollment:", err.message);
    }
  }
  console.log(`✅ Created ${enrollmentCount} student enrollments for realistic analytics.`);

  console.log("\n🎉 Database successfully seeded with highly realistic data!");
  console.log("-----------------------------------------");
  console.log("Test Instructor: instructor@eduverse.com | password123");
  console.log("Test Student: student@eduverse.com | password123");
  console.log("-----------------------------------------");
  
  process.exit();
};

seedDatabase();
