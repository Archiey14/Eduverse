import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { Enrollment } from "../models/Enrollment.js";
import { AppError } from "../utils/AppError.js";
import { progressService } from "./progressService.js";
import { activityService } from "./activityService.js";
import { notificationService } from "./notificationService.js";

export const quizService = {
  submitAttempt: async ({ quizId, studentId, answers }) => {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      throw new AppError(404, "Quiz not found or is not available.");
    }

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: quiz.course,
    });

    if (!enrollment) {
      throw new AppError(
        403,
        "You must be enrolled in this course to take this quiz."
      );
    }

    // Check attempts limit
    const attemptsCount = await QuizAttempt.countDocuments({
      quiz: quiz._id,
      student: studentId,
    });

    if (quiz.maxAttempts !== null && quiz.maxAttempts !== undefined) {
      if (attemptsCount >= quiz.maxAttempts) {
        throw new AppError(
          403,
          `You have reached the maximum number of attempts (${quiz.maxAttempts}) for this quiz.`
        );
      }
    }

    // Validate the submitted answers up front so malformed input is a clean
    // 400 instead of crashing further down (e.g. a missing questionId).
    if (!Array.isArray(answers)) {
      throw new AppError(400, "answers must be an array.");
    }

    const validQuestionIds = new Set(quiz.questions.map((q) => q._id.toString()));

    for (const [idx, ans] of answers.entries()) {
      if (!ans || typeof ans !== "object") {
        throw new AppError(400, `Answer #${idx + 1} is invalid.`);
      }
      if (!ans.questionId) {
        throw new AppError(400, `Answer #${idx + 1} is missing questionId.`);
      }
      if (!validQuestionIds.has(String(ans.questionId))) {
        throw new AppError(
          400,
          `Answer #${idx + 1} refers to a question that is not part of this quiz.`
        );
      }
      if (!Number.isInteger(ans.selectedIndex) || ans.selectedIndex < 0) {
        throw new AppError(
          400,
          `Answer #${idx + 1} must include a valid selectedIndex.`
        );
      }
    }

    // Map answers by questionId
    const studentAnswerMap = new Map();
    const validAnswers = [];
    answers.forEach((ans) => {
      studentAnswerMap.set(String(ans.questionId), ans.selectedIndex);
      validAnswers.push({
        questionId: ans.questionId,
        selectedIndex: ans.selectedIndex,
      });
    });

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const gradedQuestions = [];

    quiz.questions.forEach((q) => {
      const qId = q._id.toString();
      const selectedIndex = studentAnswerMap.get(qId);
      const isCorrect = selectedIndex === q.correctIndex;

      if (isCorrect) {
        correctCount += 1;
      }

      gradedQuestions.push({
        questionId: q._id,
        isCorrect,
        userSelectedIndex: selectedIndex !== undefined ? selectedIndex : null,
      });
    });

    const scorePercent =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const passed = scorePercent >= quiz.passPercent;

    // Save attempt record
    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      course: quiz.course,
      student: studentId,
      answers: validAnswers,
      correctCount,
      total: totalQuestions,
      scorePercent,
      passed,
      submittedAt: new Date(),
    });

    const newAttemptsCount = attemptsCount + 1;
    const attemptsLeft =
      quiz.maxAttempts !== null && quiz.maxAttempts !== undefined
        ? Math.max(0, quiz.maxAttempts - newAttemptsCount)
        : null;

    // If passed, add to enrollment.passedQuizzes if not already present
    const alreadyPassed = enrollment.passedQuizzes.some(
      (id) => id.toString() === quiz._id.toString()
    );

    if (passed && !alreadyPassed) {
      enrollment.passedQuizzes.push(quiz._id);
      await enrollment.save();
      await progressService.recomputeProgress(studentId, quiz.course);
    }

    // Log activity
    activityService.log({
      userId: studentId,
      type: passed ? "quiz_passed" : "quiz_attempted",
      courseId: quiz.course,
      refId: attempt._id,
      message: `${passed ? "Passed" : "Attempted"} quiz "${quiz.title}" with score ${scorePercent}%`,
    });

    notificationService.notify({
      userId: studentId,
      type: "quiz_result",
      message: `Quiz result for "${quiz.title}": ${scorePercent}% (${passed ? "Passed" : "Failed"})`,
      courseId: quiz.course,
    });

    // Determine whether to reveal correct answers & explanations
    // Revealed only after passing or when attempts run out
    const shouldRevealAnswers =
      passed || (attemptsLeft !== null && attemptsLeft === 0);

    const questionResults = quiz.questions.map((q) => {
      const qId = q._id.toString();
      const userSelected = studentAnswerMap.get(qId);
      const isCorrect = userSelected === q.correctIndex;

      const resObj = {
        questionId: q._id,
        text: q.text,
        options: q.options,
        isCorrect,
        userSelectedIndex: userSelected !== undefined ? userSelected : null,
      };

      if (shouldRevealAnswers) {
        resObj.correctIndex = q.correctIndex;
        resObj.explanation = q.explanation;
      }

      return resObj;
    });

    return {
      attemptId: attempt._id,
      scorePercent,
      correctCount,
      total: totalQuestions,
      passPercent: quiz.passPercent,
      passed,
      attemptsUsed: newAttemptsCount,
      attemptsLeft,
      questions: questionResults,
    };
  },
};
