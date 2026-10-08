import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api, getErrorMessage } from "../services/api";
import Navbar from "../components/Navbar";
import { Loading, Notice } from "../components/Notice";
import { useWishlist } from "../hooks/useWishlist";
import { capitalize, formatDuration, PRICE_LABEL } from "../utils/format";
import "./Discover.css";

interface DiscoverCourse {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  ratingCount: number;
  students: number;
  imageClass: string;
  icon: string;
  createdAt: number;
}

interface Instructor {
  id: string;
  name: string;
  role: string;
  students: number;
  courses: number;
  rating: number;
  ratingCount: number;
  avatar: string;
  colorClass: string;
}

const CATEGORY_STYLES = [
  { icon: "💻", className: "category-web" },
  { icon: "⌨️", className: "category-programming" },
  { icon: "🎨", className: "category-design" },
  { icon: "📊", className: "category-data" },
  { icon: "💼", className: "category-business" },
  { icon: "📣", className: "category-marketing" },
];

const IMAGE_CLASSES = ["discover-blue", "discover-yellow", "discover-green", "discover-purple"];
const ICONS = ["⚛️", "JS", "🐍", "🎨"];

const TABS = ["Popular", "Top Rated", "New"] as const;
type Tab = (typeof TABS)[number];

const formatCount = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(1)}K` : String(value);

function Discover() {
  const wishlist = useWishlist();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState<Tab>("Popular");

  const [courses, setCourses] = useState<DiscoverCourse[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [totalCourses, setTotalCourses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [coursesRes, catsRes] = await Promise.all([
          api.courses.getAll({ limit: 50 }),
          api.categories.getAll().catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;

        const raw: any[] = coursesRes.data || [];
        setTotalCourses(coursesRes.total ?? raw.length);
        setCategoryNames((catsRes.data || []).map((c: any) => c.name));

        const mentors = new Map<string, Instructor & { ratingSum: number }>();

        const mapped: DiscoverCourse[] = raw.map((c: any, idx: number) => {
          const mentorName = c.mentor?.name || "Instructor";
          const mentorId = String(c.mentor?._id || `unknown-${idx}`);
          const enrollments = c.stats?.enrollmentCount || 0;
          const ratingCount = c.stats?.ratingCount || 0;

          const existing = mentors.get(mentorId);
          if (existing) {
            existing.courses += 1;
            existing.students += enrollments;
            existing.ratingCount += ratingCount;
            existing.ratingSum += (c.stats?.ratingAvg || 0) * ratingCount;
          } else {
            mentors.set(mentorId, {
              id: mentorId,
              name: mentorName,
              role: c.mentor?.mentorProfile?.headline || "Instructor",
              students: enrollments,
              courses: 1,
              rating: 0,
              ratingCount,
              ratingSum: (c.stats?.ratingAvg || 0) * ratingCount,
              avatar: mentorName.substring(0, 2).toUpperCase(),
              colorClass: mentors.size % 2 === 0 ? "instructor-indigo" : "instructor-green",
            });
          }

          return {
            id: c._id,
            slug: c.slug || c._id,
            title: c.title,
            instructor: mentorName,
            category: c.category?.name || "Uncategorised",
            level: capitalize(c.level) || "Beginner",
            duration: formatDuration(c.stats?.totalDurationMin),
            rating: c.stats?.ratingAvg || 0,
            ratingCount,
            students: enrollments,
            imageClass: IMAGE_CLASSES[idx % IMAGE_CLASSES.length],
            icon: ICONS[idx % ICONS.length],
            createdAt: c.createdAt ? new Date(c.createdAt).getTime() : 0,
          };
        });

        setCourses(mapped);
        setInstructors(
          Array.from(mentors.values())
            .map(({ ratingSum, ...rest }) => ({
              ...rest,
              rating:
                rest.ratingCount > 0
                  ? Math.round((ratingSum / rest.ratingCount) * 10) / 10
                  : 0,
            }))
            .sort((a, b) => b.students - a.students)
            .slice(0, 4)
        );
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "Could not load courses."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Real number of courses per category
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    courses.forEach((c) => counts.set(c.category, (counts.get(c.category) || 0) + 1));

    const names = categoryNames.length > 0 ? categoryNames : Array.from(counts.keys());
    return names.slice(0, 6).map((name, idx) => ({
      name,
      count: counts.get(name) || 0,
      ...CATEGORY_STYLES[idx % CATEGORY_STYLES.length],
    }));
  }, [courses, categoryNames]);

  const filteredCourses = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = courses.filter((course) => {
      const matchesSearch =
        !query ||
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query);

      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return [...filtered].sort((a, b) => {
      if (activeTab === "Top Rated") return b.rating - a.rating || b.ratingCount - a.ratingCount;
      if (activeTab === "New") return b.createdAt - a.createdAt;
      return b.students - a.students;
    });
  }, [courses, searchQuery, selectedCategory, activeTab]);

  const totalLearners = courses.reduce((sum, c) => sum + c.students, 0);
  const topCategories = categories
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="landing-page">
      <Navbar />

      <main className="landing-container" style={{ padding: "40px 0" }}>
        <div className="discover-content" style={{ padding: "0" }}>
          {/* Hero */}
          <section className="discover-hero">
            <div className="discover-hero-content">
              <span className="discover-eyebrow">✦ EXPLORE & LEARN</span>

              <h1>
                Discover your next
                <span> learning adventure.</span>
              </h1>

              <p>
                Explore courses, discover new skills, and find instructors who can help you
                reach your goals.
              </p>

              <div className="discover-search">
                <span className="discover-search-icon">⌕</span>

                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="popular-searches">
                <span>Try:</span>

                {["React", "Python", "JavaScript", "UI/UX"].map((term) => (
                  <button key={term} type="button" onClick={() => setSearchQuery(term)}>
                    {term}
                  </button>
                ))}
              </div>
            </div>

            <div className="discover-hero-visual">
              <div className="discover-orbit orbit-one"></div>
              <div className="discover-orbit orbit-two"></div>

              <div className="discover-main-orb">
                <span>📚</span>
              </div>

              {topCategories.map((category, index) => (
                <div
                  key={category.name}
                  className={`floating-discover-card ${
                    ["card-one", "card-two", "card-three"][index]
                  }`}
                >
                  <span>{category.icon}</span>

                  <div>
                    <strong>{category.name}</strong>
                    <small>
                      {category.count} course{category.count === 1 ? "" : "s"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {error && <Notice message={error} onRetry={() => window.location.reload()} />}

          {loading ? (
            <Loading label="Loading courses..." />
          ) : (
            <>
              {/* Categories */}
              {categories.length > 0 && (
                <section className="discover-section">
                  <div className="discover-section-header">
                    <div>
                      <span className="section-eyebrow">EXPLORE BY TOPIC</span>
                      <h2>Browse categories</h2>
                    </div>

                    <Link to="/courses">View all →</Link>
                  </div>

                  <div className="category-grid">
                    {categories.map((category) => (
                      <button
                        key={category.name}
                        type="button"
                        className={`discover-category-card ${category.className}`}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.name ? "All" : category.name
                          )
                        }
                        aria-pressed={selectedCategory === category.name}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <strong>{category.name}</strong>
                        <span>
                          {category.count} Course{category.count === 1 ? "" : "s"}
                        </span>
                        <span className="category-arrow">→</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Courses */}
              <section className="discover-section">
                <div className="discover-section-header">
                  <div>
                    <span className="section-eyebrow">
                      {selectedCategory === "All" ? "FEATURED COURSES" : selectedCategory.toUpperCase()}
                    </span>
                    <h2>Courses you'll love</h2>
                  </div>

                  <Link to="/courses">Browse all courses →</Link>
                </div>

                <div className="discover-tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      className={activeTab === tab ? "active" : ""}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}

                  {selectedCategory !== "All" && (
                    <button type="button" onClick={() => setSelectedCategory("All")}>
                      ✕ {selectedCategory}
                    </button>
                  )}
                </div>

                <div className="discover-course-grid">
                  {filteredCourses.slice(0, 4).map((course) => {
                    const saved = wishlist.has(course.id);
                    return (
                      <article className="discover-course-card" key={course.id}>
                        <div className={`discover-course-image ${course.imageClass}`}>
                          <span className="discover-course-icon">{course.icon}</span>

                          <button
                            type="button"
                            className="discover-course-wishlist"
                            onClick={() => wishlist.toggle(course.id)}
                            aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
                            aria-pressed={saved}
                          >
                            {saved ? "♥" : "♡"}
                          </button>
                        </div>

                        <div className="discover-course-body">
                          <span className="discover-course-category">{course.category}</span>

                          <h3>{course.title}</h3>

                          <p className="discover-course-instructor">{course.instructor}</p>

                          <div className="discover-course-rating">
                            {course.ratingCount > 0 ? (
                              <>
                                <strong>{course.rating}</strong>
                                <span>★★★★★</span>
                                <small>({course.ratingCount})</small>
                              </>
                            ) : (
                              <small>
                                {course.students.toLocaleString()} student
                                {course.students === 1 ? "" : "s"}
                              </small>
                            )}
                          </div>

                          <div className="discover-course-meta">
                            <span>◷ {course.duration}</span>
                            <span>• {course.level}</span>
                          </div>

                          <div className="discover-course-footer">
                            <strong>{PRICE_LABEL}</strong>

                            <Link to={`/courses/${course.slug}`}>View Course →</Link>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {filteredCourses.length === 0 && (
                  <div className="discover-no-results">
                    <span>🔎</span>

                    <h3>{courses.length === 0 ? "No courses yet" : "No courses found"}</h3>

                    <p>
                      {courses.length === 0
                        ? "No courses have been published yet. Please check back soon."
                        : "Try searching for another skill or category."}
                    </p>

                    {courses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("All");
                        }}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                )}
              </section>

              {/* Instructors */}
              {instructors.length > 0 && (
                <section className="discover-section">
                  <div className="discover-section-header">
                    <div>
                      <span className="section-eyebrow">LEARN FROM THE BEST</span>
                      <h2>Featured instructors</h2>
                    </div>
                  </div>

                  <div className="instructor-grid">
                    {instructors.map((instructor) => (
                      <article className="featured-instructor" key={instructor.id}>
                        <div
                          className={`featured-instructor-avatar ${instructor.colorClass}`}
                        >
                          {instructor.avatar}
                        </div>

                        <h3>{instructor.name}</h3>

                        <p>{instructor.role}</p>

                        <div className="featured-instructor-details">
                          <span>
                            <strong style={{ color: "#293247" }}>
                              {instructor.ratingCount > 0 ? `★ ${instructor.rating}` : "★ —"}
                            </strong>{" "}
                            Rating
                          </span>

                          <span>
                            <strong style={{ color: "#293247" }}>
                              👥 {formatCount(instructor.students)}
                            </strong>{" "}
                            Students
                          </span>

                          <span>
                            <strong style={{ color: "#293247" }}>▣ {instructor.courses}</strong>{" "}
                            Courses
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Stats */}
              <section className="discover-stats">
                <div>
                  <strong>{totalCourses}</strong>
                  <span>Courses</span>
                </div>

                <div>
                  <strong>{instructors.length}</strong>
                  <span>Top Instructors</span>
                </div>

                <div>
                  <strong>{formatCount(totalLearners)}</strong>
                  <span>Enrollments</span>
                </div>

                <div>
                  <strong>{categoryNames.length || categories.length}</strong>
                  <span>Categories</span>
                </div>
              </section>
            </>
          )}

          {/* CTA */}
          <section className="discover-cta">
            <div>
              <span>READY TO START?</span>

              <h2>
                Your next skill is
                <br />
                waiting for you.
              </h2>

              <p>
                Explore our complete course library and start learning something new today.
              </p>

              <Link to="/courses" className="discover-cta-button">
                Explore All Courses →
              </Link>
            </div>

            <div className="cta-decoration">
              <span>🚀</span>
            </div>
          </section>

          <footer className="discover-footer">
            <div>
              <strong>Eduverse</strong>
              <p>Learn new skills. Build your future.</p>
            </div>

            <div className="discover-footer-links">
              <Link to="/courses">Courses</Link>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>

            <p>© 2026 Eduverse. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Discover;
