
import mongoose from "mongoose";

import { Conversation } from "../models/Conversation.js";
import { Enrollment } from "../models/Enrollment.js";
import { Course } from "../models/Course.js";

// =====================================================
// CHECK COURSE MEMBERSHIP
// =====================================================

export const getCourseMembership = async (userId, courseId) => {
  if (
    !mongoose.isValidObjectId(userId) ||
    !mongoose.isValidObjectId(courseId)
  ) {
    return {
      allowed: false,
      course: null,
      isMentor: false,
      isEnrolled: false,
    };
  }

  const course = await Course.findById(courseId).select(
    "_id mentor title status"
  );

  if (!course) {
    return {
      allowed: false,
      course: null,
      isMentor: false,
      isEnrolled: false,
    };
  }

  // Check whether the current user is the course mentor.
  const isMentor =
    course.mentor != null &&
    String(course.mentor) === String(userId);

  // Only active enrollments grant student group access.
  const enrollment = await Enrollment.findOne({
    student: userId,
    course: courseId,
    status: "active",
  }).select("_id");

  const isEnrolled = Boolean(enrollment);

  return {
    allowed: isMentor || isEnrolled,
    course,
    isMentor,
    isEnrolled,
  };
};

// =====================================================
// CHECK CONVERSATION ACCESS
// =====================================================

export const canAccessConversation = async (
  conversationId,
  userId
) => {
  if (
    !mongoose.isValidObjectId(conversationId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    return false;
  }

  const conversation = await Conversation.findById(
    conversationId
  ).select("type course participants");

  if (!conversation) {
    return false;
  }

  // Direct conversations are accessible only to participants.
  if (conversation.type === "direct") {
    return conversation.participants.some(
      (participantId) =>
        String(participantId) === String(userId)
    );
  }

  // Course group conversations require active enrollment
  // or ownership of the course as its mentor.
  if (
    conversation.type === "course" &&
    conversation.course
  ) {
    const membership = await getCourseMembership(
      userId,
      conversation.course
    );

    return membership.allowed;
  }

  return false;
};

// =====================================================
// GET OR CREATE COURSE GROUP
// =====================================================

export const getOrCreateCourseConversation = async (
  courseId
) => {
  if (!mongoose.isValidObjectId(courseId)) {
    throw new Error("Invalid course ID.");
  }

  try {
    // Reuse the existing group or create it once.
    return await Conversation.findOneAndUpdate(
      {
        type: "course",
        course: courseId,
      },
      {
        $setOnInsert: {
          type: "course",
          course: courseId,
          participants: [],
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    // Another request may have created the group simultaneously.
    if (error.code === 11000) {
      const existingConversation =
        await Conversation.findOne({
          type: "course",
          course: courseId,
        });

      if (existingConversation) {
        return existingConversation;
      }
    }

    throw error;
  }
};

// =====================================================
// CREATE A STABLE DIRECT CONVERSATION KEY
// =====================================================

export const makeDirectKey = (
  firstUserId,
  secondUserId
) => {
  if (
    !mongoose.isValidObjectId(firstUserId) ||
    !mongoose.isValidObjectId(secondUserId)
  ) {
    throw new Error("Invalid user ID.");
  }

  if (String(firstUserId) === String(secondUserId)) {
    throw new Error(
      "A user cannot create a conversation with themselves."
    );
  }

  // Sorting ensures both users generate the same key.
  return [
    String(firstUserId),
    String(secondUserId),
  ]
    .sort()
    .join("_");
};

// =====================================================
// GET OR CREATE DIRECT CONVERSATION
// =====================================================

export const getOrCreateDirectConversation = async (
  firstUserId,
  secondUserId
) => {
  const directKey = makeDirectKey(
    firstUserId,
    secondUserId
  );

  try {
    return await Conversation.findOneAndUpdate(
      {
        type: "direct",
        directKey,
      },
      {
        $setOnInsert: {
          type: "direct",
          directKey,
          participants: [
            firstUserId,
            secondUserId,
          ],
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    // Handle concurrent requests for the same user pair.
    if (error.code === 11000) {
      const existingConversation =
        await Conversation.findOne({
          type: "direct",
          directKey,
        });

      if (existingConversation) {
        return existingConversation;
      }
    }

    throw error;
  }
};
