import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { api, getErrorMessage } from "../services/api";
import { useAuth } from "../context/AuthContext";
import StudentLayout from "../components/StudentLayout";
import { Loading, Notice } from "../components/Notice";

import {
  buildAchievements,
  emptyAchievementStats,
  toAchievementStats,
} from "../utils/achievements";

import type { AchievementStats } from "../utils/achievements";

import "./Achievements.css";

const categories = [
  "All",
  "Courses",
  "Quizzes",
  "Streaks",
  "Learning",
  "Milestones",
];

function Achievements() {
  const { user } = useAuth();

  const [stats, setStats] =
    useState<AchievementStats>(emptyAchievementStats);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeCategory, setActiveCategory] = useState("All");
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const firstName = (user?.name || "Learner").split(" ")[0];

  /* =========================================================
     LOAD ACHIEVEMENT DATA
     ========================================================= */

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    api.dashboard
      .getStudentDashboard()
      .then((res) => {
        if (cancelled) return;

        setStats(toAchievementStats(res.data?.stats));
      })
      .catch((err) => {
        if (cancelled) return;

        setError(
          getErrorMessage(
            err,
            "Could not load your achievements."
          )
        );
      })
      .finally(() => {
        if (cancelled) return;

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================================
     BUILD ACHIEVEMENTS
     ========================================================= */

  const achievements = useMemo(
    () => buildAchievements(stats),
    [stats]
  );

  /* =========================================================
     ACHIEVEMENT COUNTS
     ========================================================= */

  const earnedCount = achievements.filter(
    (achievement) => achievement.earned
  ).length;

  const totalCount = achievements.length;

  const lockedCount = Math.max(
    totalCount - earnedCount,
    0
  );

  const completionPercentage =
    totalCount > 0
      ? Math.round((earnedCount / totalCount) * 100)
      : 0;

  /* =========================================================
     FILTER ACHIEVEMENTS
     ========================================================= */

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesCategory =
        activeCategory === "All" ||
        achievement.category === activeCategory;

      const matchesEarned =
        !showEarnedOnly || achievement.earned;

      return matchesCategory && matchesEarned;
    });
  }, [
    achievements,
    activeCategory,
    showEarnedOnly,
  ]);

  /* =========================================================
     NEXT ACHIEVEMENT
     ========================================================= */

  const nextUp = useMemo(() => {
    const locked = achievements.filter(
      (achievement) => !achievement.earned
    );

    if (locked.length === 0) {
      return null;
    }

    return locked.reduce((best, achievement) => {
      const bestProgress =
        best.target > 0
          ? best.progress / best.target
          : 0;

      const currentProgress =
        achievement.target > 0
          ? achievement.progress / achievement.target
          : 0;

      return currentProgress > bestProgress
        ? achievement
        : best;
    });
  }, [achievements]);

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <StudentLayout
      activeItem="achievements"
      searchPlaceholder="Search..."
    >
      <div className="achievements-content">

        {/* =====================================================
            HEADER
            ===================================================== */}

        <section className="achievements-header">
          <div>
            <span className="section-eyebrow">
              YOUR MILESTONES
            </span>

            <h1>
              Achievements 🏆
            </h1>

            <p>
              Celebrate your progress and keep reaching
              new learning milestones.
            </p>
          </div>

          <div className="achievement-completion">

            <div
              className="completion-circle"
              style={
                {
                  "--completion": `${completionPercentage * 3.6}deg`,
                } as React.CSSProperties
              }
            >
              <div className="completion-inner">
                <strong>
                  {completionPercentage}%
                </strong>

                <span>
                  Complete
                </span>
              </div>
            </div>

            <div>
              <strong>
                {earnedCount} of {totalCount}
              </strong>

              <span>
                Achievements earned
              </span>
            </div>

          </div>
        </section>

        {/* =====================================================
            ERROR MESSAGE
            ===================================================== */}

        {error && (
          <Notice message={error} />
        )}

        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading ? (
          <Loading label="Loading your achievements..." />
        ) : (
          <>

            {/* =================================================
                STATISTICS
                ================================================= */}

            <section className="achievement-stats">

              <div className="achievement-stat-card">
                <div className="stat-icon earned">
                  🏆
                </div>

                <div>
                  <span>
                    Earned
                  </span>

                  <strong>
                    {earnedCount}
                  </strong>
                </div>
              </div>


              <div className="achievement-stat-card">
                <div className="stat-icon locked">
                  🔒
                </div>

                <div>
                  <span>
                    Locked
                  </span>

                  <strong>
                    {lockedCount}
                  </strong>
                </div>
              </div>


              <div className="achievement-stat-card">
                <div className="stat-icon streak">
                  🔥
                </div>

                <div>
                  <span>
                    Current Streak
                  </span>

                  <strong>
                    {stats.streakDays}{" "}
                    {stats.streakDays === 1
                      ? "day"
                      : "days"}
                  </strong>
                </div>
              </div>


              <div className="achievement-stat-card">
                <div className="stat-icon points">
                  📖
                </div>

                <div>
                  <span>
                    Lessons Completed
                  </span>

                  <strong>
                    {stats.lessonsCompleted}
                  </strong>
                </div>
              </div>

            </section>

            {/* =================================================
                FILTER TOOLBAR
                ================================================= */}

            <section className="achievements-toolbar">

              <div className="achievement-tabs">

                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={
                      activeCategory === category
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setActiveCategory(category)
                    }
                  >
                    {category}
                  </button>
                ))}

              </div>


              <label className="earned-toggle">

                <input
                  type="checkbox"
                  checked={showEarnedOnly}
                  onChange={(event) =>
                    setShowEarnedOnly(
                      event.target.checked
                    )
                  }
                />

                <span className="toggle-check"></span>

                Show earned only

              </label>

            </section>

            {/* =================================================
                ACHIEVEMENTS
                ================================================= */}

            <section className="achievement-section">

              <div className="achievement-section-heading">
                <div>

                  <h2>
                    Your Achievements
                  </h2>

                  <p>
                    {filteredAchievements.length}{" "}
                    {filteredAchievements.length === 1
                      ? "achievement"
                      : "achievements"}{" "}
                    displayed
                  </p>

                </div>
              </div>


              {filteredAchievements.length > 0 ? (
                <div className="achievement-grid">

                  {filteredAchievements.map(
                    (achievement) => {

                      const progressPercentage =
                        achievement.target > 0
                          ? Math.min(
                              (achievement.progress /
                                achievement.target) *
                                100,
                              100
                            )
                          : 0;

                      return (
                        <article
                          key={achievement.id}
                          className={`achievement-card ${
                            achievement.earned
                              ? "earned-card"
                              : "locked-card"
                          }`}
                        >

                          {/* Achievement icon */}

                          <div
                            className="achievement-icon"
                            style={{
                              background: `${achievement.color}18`,
                              borderColor: `${achievement.color}35`,
                            }}
                          >
                            {achievement.icon}
                          </div>


                          {/* Status badge */}

                          {achievement.earned ? (
                            <div className="earned-badge">
                              ✓ Earned
                            </div>
                          ) : (
                            <div className="locked-badge">
                              🔒 Locked
                            </div>
                          )}


                          {/* Content */}

                          <div className="achievement-card-content">

                            <span className="achievement-category">
                              {achievement.category}
                            </span>

                            <h3>
                              {achievement.title}
                            </h3>

                            <p>
                              {achievement.description}
                            </p>


                            {/* Earned */}

                            {achievement.earned ? (
                              <div className="achievement-earned-date">
                                <span>
                                  ✓
                                </span>

                                Unlocked
                              </div>
                            ) : (

                              /* Locked */

                              <div className="achievement-progress">

                                <div className="progress-info">

                                  <span>
                                    Progress
                                  </span>

                                  <strong>
                                    {achievement.progress}{" "}
                                    /{" "}
                                    {achievement.target}
                                  </strong>

                                </div>


                                <div className="progress-track">

                                  <div
                                    className="progress-fill"
                                    style={{
                                      width: `${progressPercentage}%`,
                                      background:
                                        achievement.color,
                                    }}
                                  />

                                </div>

                              </div>
                            )}

                          </div>

                        </article>
                      );
                    }
                  )}

                </div>
              ) : (

                /* =================================================
                   EMPTY STATE
                   ================================================= */

                <div className="achievement-empty">

                  <div>
                    🏆
                  </div>

                  <h3>
                    No achievements found
                  </h3>

                  <p>
                    Try changing the category or
                    turning off the earned-only filter.
                  </p>

                </div>
              )}

            </section>


            {/* =================================================
                MOTIVATION CTA
                ================================================= */}

            <section className="achievement-motivation">

              <div className="motivation-icon">
                🚀
              </div>


              <div className="motivation-content">

                <span>
                  KEEP GOING!
                </span>

                <h2>
                  {nextUp
                    ? `You're doing great, ${firstName}!`
                    : `Amazing work, ${firstName}!`}
                </h2>

                <p>
                  {nextUp
                    ? `Next up: "${nextUp.title}" (${nextUp.progress} of ${nextUp.target}).`
                    : "You've unlocked every achievement. Keep learning to stay sharp."}
                </p>

              </div>


              <Link
                to="/student/courses"
                className="motivation-button"
              >
                Continue Learning →
              </Link>

            </section>

          </>
        )}

      </div>
    </StudentLayout>
  );
}

export default Achievements;