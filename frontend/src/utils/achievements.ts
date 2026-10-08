/**
 * Achievements are derived from the stats returned by GET /student/dashboard,
 * so they always reflect the learner's real progress.
 */

export interface AchievementStats {
  enrolledCount: number;
  completedCount: number;
  lessonsCompleted: number;
  hoursLearned: number;
  streakDays: number;
  bestQuizScore: number;
  passedQuizzesCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "Courses" | "Quizzes" | "Streaks" | "Learning" | "Milestones";
  icon: string;
  color: string;
  earned: boolean;
  progress: number;
  target: number;
}

export const emptyAchievementStats: AchievementStats = {
  enrolledCount: 0,
  completedCount: 0,
  lessonsCompleted: 0,
  hoursLearned: 0,
  streakDays: 0,
  bestQuizScore: 0,
  passedQuizzesCount: 0,
};

export const toAchievementStats = (raw: any): AchievementStats => ({
  enrolledCount: raw?.enrolledCount || 0,
  completedCount: raw?.completedCount || 0,
  lessonsCompleted: raw?.lessonsCompleted || 0,
  hoursLearned: raw?.hoursLearned || 0,
  streakDays: raw?.streakDays || 0,
  bestQuizScore: raw?.bestQuizScore || 0,
  passedQuizzesCount: raw?.passedQuizzesCount || 0,
});

type Definition = Omit<Achievement, "earned" | "progress"> & {
  value: (s: AchievementStats) => number;
};

const DEFINITIONS: Definition[] = [
  {
    id: "first-step",
    title: "First Step",
    description: "Enroll in your first course",
    category: "Milestones",
    icon: "🚀",
    color: "#6366f1",
    target: 1,
    value: (s) => s.enrolledCount,
  },
  {
    id: "course-starter",
    title: "Course Starter",
    description: "Complete your first course",
    category: "Courses",
    icon: "🎓",
    color: "#10b981",
    target: 1,
    value: (s) => s.completedCount,
  },
  {
    id: "quiz-master",
    title: "Quiz Master",
    description: "Score 90% or higher on a quiz",
    category: "Quizzes",
    icon: "🏆",
    color: "#f59e0b",
    target: 90,
    value: (s) => s.bestQuizScore,
  },
  {
    id: "streak-7",
    title: "7 Day Streak",
    description: "Learn for 7 consecutive days",
    category: "Streaks",
    icon: "🔥",
    color: "#ef4444",
    target: 7,
    value: (s) => s.streakDays,
  },
  {
    id: "knowledge-seeker",
    title: "Knowledge Seeker",
    description: "Complete 25 lessons",
    category: "Learning",
    icon: "📚",
    color: "#8b5cf6",
    target: 25,
    value: (s) => s.lessonsCompleted,
  },
  {
    id: "perfect-score",
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    category: "Quizzes",
    icon: "💯",
    color: "#ec4899",
    target: 100,
    value: (s) => s.bestQuizScore,
  },
  {
    id: "course-collector",
    title: "Course Collector",
    description: "Complete 5 courses",
    category: "Courses",
    icon: "📖",
    color: "#0ea5e9",
    target: 5,
    value: (s) => s.completedCount,
  },
  {
    id: "streak-14",
    title: "14 Day Streak",
    description: "Learn for 14 consecutive days",
    category: "Streaks",
    icon: "⚡",
    color: "#f97316",
    target: 14,
    value: (s) => s.streakDays,
  },
  {
    id: "learning-champion",
    title: "Learning Champion",
    description: "Complete 50 lessons",
    category: "Learning",
    icon: "🌟",
    color: "#14b8a6",
    target: 50,
    value: (s) => s.lessonsCompleted,
  },
  {
    id: "dedicated-learner",
    title: "Dedicated Learner",
    description: "Spend 100 hours learning",
    category: "Milestones",
    icon: "⏱️",
    color: "#64748b",
    target: 100,
    value: (s) => s.hoursLearned,
  },
];

export const buildAchievements = (stats: AchievementStats): Achievement[] =>
  DEFINITIONS.map(({ value, ...def }) => {
    const current = value(stats);
    return {
      ...def,
      earned: current >= def.target,
      progress: Math.min(Math.round(current * 10) / 10, def.target),
    };
  });
