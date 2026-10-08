import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Navbar from "../components/Navbar";
import "./Discover.css";

interface DiscoverCourse {
  id: string | number;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  rating: number;
  students: number;
  price: number;
  imageClass: string;
  icon: string;
  badge?: string;
}

interface Instructor {
  id: number;
  name: string;
  role: string;
  students: string;
  courses: number;
  avatar: string;
  colorClass: string;
}

const defaultCourses: DiscoverCourse[] = [];

const categories = [
  {
    name: "Web Development",
    icon: "💻",
    courses: "120+ Courses",
    className: "category-web",
  },
  {
    name: "Programming",
    icon: "⌨️",
    courses: "95+ Courses",
    className: "category-programming",
  },
  {
    name: "Design",
    icon: "🎨",
    courses: "70+ Courses",
    className: "category-design",
  },
  {
    name: "Data Science",
    icon: "📊",
    courses: "65+ Courses",
    className: "category-data",
  },
  {
    name: "Business",
    icon: "💼",
    courses: "55+ Courses",
    className: "category-business",
  },
  {
    name: "Marketing",
    icon: "📣",
    courses: "45+ Courses",
    className: "category-marketing",
  },
];

function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("Trending");
  const [coursesList, setCoursesList] = useState<DiscoverCourse[]>(defaultCourses);

  const [instructorsList, setInstructorsList] = useState<Instructor[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.courses.getAll({ limit: 12 });
        if (res.data && res.data.length > 0) {
          const uniqueMentors = new Map<string, Instructor>();
          
          const mapped: DiscoverCourse[] = res.data.map((c: any, idx: number) => {
            const mentorName = c.mentor?.name || "Instructor";
            const mentorId = c.mentor?._id || `temp-${idx}`;
            
            if (!uniqueMentors.has(mentorId)) {
              uniqueMentors.set(mentorId, {
                id: mentorId,
                name: mentorName,
                role: c.mentor?.mentorProfile?.headline || "Expert Instructor",
                students: `${((c.stats?.enrollmentCount || 1200) / 1000).toFixed(1)}K`,
                courses: 1,
                avatar: mentorName.substring(0, 2).toUpperCase(),
                colorClass: idx % 2 === 0 ? "instructor-indigo" : "instructor-green"
              });
            } else {
              const existing = uniqueMentors.get(mentorId);
              if (existing) existing.courses += 1;
            }
            
            return {
              id: c._id || c.slug,
              title: c.title,
              instructor: mentorName,
              category: c.category?.name || "Web Development",
              level: c.level ? c.level.charAt(0).toUpperCase() + c.level.slice(1) : "Intermediate",
              duration: `${Math.round((c.stats?.totalDurationMin || 120) / 60)}h ${
                (c.stats?.totalDurationMin || 120) % 60
              }m`,
              rating: c.stats?.ratingAvg || 4.9,
              students: c.stats?.enrollmentCount || 1200 + idx * 150,
              price: 49,
              imageClass:
                idx % 4 === 0 ? "discover-blue"
                  : idx % 4 === 1 ? "discover-yellow"
                  : idx % 4 === 2 ? "discover-green"
                  : "discover-purple",
              icon:
                idx % 4 === 0 ? "⚛️"
                  : idx % 4 === 1 ? "JS"
                  : idx % 4 === 2 ? "🐍"
                  : "🎨",
              badge: idx === 0 ? "Bestseller" : idx === 1 ? "Popular" : undefined,
            };
          });
          
          setCoursesList(mapped);
          setInstructorsList(Array.from(uniqueMentors.values()).slice(0, 4));
        } else {
          setCoursesList([]);
        }
      } catch {
        setCoursesList([]);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return coursesList.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [coursesList, searchQuery, selectedCategory]);

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
                Explore courses, discover new skills, and find instructors who
                can help you reach your goals.
              </p>

              <div className="discover-search">
                <span className="discover-search-icon">⌕</span>

                <input
                  type="text"
                  placeholder="What do you want to learn?"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />

                <button>Search</button>
              </div>

              <div className="popular-searches">
                <span>Popular:</span>

                <button onClick={() => setSearchQuery("React")}>React</button>
                <button onClick={() => setSearchQuery("Python")}>Python</button>
                <button onClick={() => setSearchQuery("JavaScript")}>
                  JavaScript
                </button>
                <button onClick={() => setSearchQuery("UI/UX")}>UI/UX</button>
              </div>
            </div>

            <div className="discover-hero-visual">
              <div className="discover-orbit orbit-one"></div>
              <div className="discover-orbit orbit-two"></div>

              <div className="discover-main-orb">
                <span>📚</span>
              </div>

              <div className="floating-discover-card card-one">
                <span>⚛️</span>
                <div>
                  <strong>React</strong>
                  <small>Trending skill</small>
                </div>
              </div>

              <div className="floating-discover-card card-two">
                <span>🐍</span>
                <div>
                  <strong>Python</strong>
                  <small>3.4K learners</small>
                </div>
              </div>

              <div className="floating-discover-card card-three">
                <span>🎨</span>
                <div>
                  <strong>Design</strong>
                  <small>Popular category</small>
                </div>
              </div>
            </div>
          </section>

          {/* Categories */}
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
                  className={`discover-category-card ${category.className}`}
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <span className="category-icon">{category.icon}</span>

                  <strong>{category.name}</strong>

                  <span>{category.courses}</span>

                  <span className="category-arrow">→</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recommended */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">RECOMMENDED FOR YOU</span>
                <h2>Courses you'll love</h2>
              </div>

              <Link to="/courses">Browse all courses →</Link>
            </div>

            <div className="discover-tabs">
              {["Trending", "Popular", "Top Rated", "New"].map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? "active" : ""}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="discover-course-grid">
              {filteredCourses.slice(0, 4).map((course) => (
                <article className="discover-course-card" key={course.id}>
                  <div className={`discover-course-image ${course.imageClass}`}>
                    <span className="discover-course-icon">{course.icon}</span>

                    {course.badge && (
                      <span className="discover-course-badge">
                        {course.badge}
                      </span>
                    )}

                    <button
                      className="discover-course-wishlist"
                      aria-label="Add to wishlist"
                    >
                      ♡
                    </button>
                  </div>

                  <div className="discover-course-body">
                    <span className="discover-course-category">
                      {course.category}
                    </span>

                    <h3>{course.title}</h3>

                    <p className="discover-course-instructor">
                      {course.instructor}
                    </p>

                    <div className="discover-course-rating">
                      <strong>{course.rating}</strong>
                      <span>★★★★★</span>
                      <small>({course.students.toLocaleString()})</small>
                    </div>

                    <div className="discover-course-meta">
                      <span>◷ {course.duration}</span>
                      <span>• {course.level}</span>
                    </div>

                    <div className="discover-course-footer">
                      <strong>${course.price}</strong>

                      <Link to={`/courses/${course.id}`}>
                        View Course →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="discover-no-results">
                <span>🔎</span>
                <h3>No courses found</h3>
                <p>Try searching for another skill or category.</p>

                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Search
                </button>
              </div>
            )}
          </section>

          {/* Learning Paths */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">LEARN WITH PURPOSE</span>
                <h2>Popular learning paths</h2>
              </div>
            </div>

            <div className="learning-path-grid">
              <Link to="/courses" className="learning-path-card path-web">
                <div className="path-icon">💻</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>Full-Stack Developer</h3>
                  <p>
                    Master frontend, backend, databases and deployment.
                  </p>

                  <div className="path-bottom">
                    <span>8 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>

              <Link to="/courses" className="learning-path-card path-data">
                <div className="path-icon">📊</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>Data Scientist</h3>
                  <p>
                    Learn Python, data analysis, statistics and machine learning.
                  </p>

                  <div className="path-bottom">
                    <span>10 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>

              <Link to="/courses" className="learning-path-card path-design">
                <div className="path-icon">🎨</div>

                <div className="path-content">
                  <span>CAREER PATH</span>
                  <h3>UI/UX Designer</h3>
                  <p>
                    Build beautiful interfaces and meaningful user experiences.
                  </p>

                  <div className="path-bottom">
                    <span>7 courses</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Instructors */}
          <section className="discover-section">
            <div className="discover-section-header">
              <div>
                <span className="section-eyebrow">LEARN FROM THE BEST</span>
                <h2>Featured instructors</h2>
              </div>

              <button className="view-instructors-button">
                Meet all instructors →
              </button>
            </div>

            <div className="instructor-grid">
              {instructorsList.map((instructor) => (
                <article
                  className="featured-instructor"
                  key={instructor.id}
                >
                  <div
                    className={`featured-instructor-avatar ${instructor.colorClass}`}
                  >
                    {instructor.avatar}
                  </div>

                  <h3>{instructor.name}</h3>

                  <p>{instructor.role}</p>

                  <div className="featured-instructor-details">
                    <span><strong style={{ color: "#293247" }}>★ 4.9</strong> Rating</span>
                    <span><strong style={{ color: "#293247" }}>👥 {instructor.students}</strong> Students</span>
                    <span><strong style={{ color: "#293247" }}>▣ {instructor.courses}</strong> Courses</span>
                  </div>

                  <button className="view-instructor-button">
                    View Profile
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="discover-stats">
            <div>
              <strong>500+</strong>
              <span>Courses</span>
            </div>

            <div>
              <strong>120+</strong>
              <span>Expert Instructors</span>
            </div>

            <div>
              <strong>25K+</strong>
              <span>Active Learners</span>
            </div>

            <div>
              <strong>95%</strong>
              <span>Student Satisfaction</span>
            </div>
          </section>

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
                Explore our complete course library and start learning something
                new today.
              </p>

              <Link to="/courses" className="discover-cta-button">
                Explore All Courses →
              </Link>
            </div>

            <div className="cta-decoration">
              <span>🚀</span>
            </div>
          </section>

          {/* Footer */}
          <footer className="discover-footer">
            <div>
              <strong>LearnHub</strong>
              <p>Learn new skills. Build your future.</p>
            </div>

            <div className="discover-footer-links">
              <Link to="/courses">Help Center</Link>
              <Link to="/courses">Privacy</Link>
              <Link to="/courses">Terms</Link>
              <Link to="/courses">Courses</Link>
            </div>

            <p>© 2026 LearnHub. All rights reserved.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Discover;
