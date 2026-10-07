
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./InstructorQuizzes.css";

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  marks: number;
}

interface Quiz {
  id: number;
  title: string;
  course: string;
  questions: Question[];
  duration: number;
  attempts: number;
  averageScore: number;
  status: "Published" | "Draft";
}

const initialQuizzes: Quiz[] = [
  {
    id: 1,
    title: "React Fundamentals Quiz",
    course: "Complete React & TypeScript",
    duration: 20,
    attempts: 186,
    averageScore: 82,
    status: "Published",
    questions: [
      {
        id: 1,
        question: "What is React?",
        options: [
          "A JavaScript library",
          "A database",
          "A programming language",
          "An operating system",
        ],
        correctAnswer: "A JavaScript library",
        marks: 2,
      },
      {
        id: 2,
        question: "Which hook is used to manage state?",
        options: ["useEffect", "useState", "useRef", "useMemo"],
        correctAnswer: "useState",
        marks: 2,
      },
    ],
  },
  {
    id: 2,
    title: "JavaScript Basics Assessment",
    course: "JavaScript Fundamentals",
    duration: 30,
    attempts: 142,
    averageScore: 78,
    status: "Published",
    questions: [
      {
        id: 1,
        question: "Which keyword declares a constant?",
        options: ["var", "let", "const", "static"],
        correctAnswer: "const",
        marks: 2,
      },
      {
        id: 2,
        question: "Which method adds an item to the end of an array?",
        options: ["pop()", "push()", "shift()", "slice()"],
        correctAnswer: "push()",
        marks: 2,
      },
    ],
  },
  {
    id: 3,
    title: "CSS Layout Quiz",
    course: "Modern CSS Masterclass",
    duration: 15,
    attempts: 96,
    averageScore: 85,
    status: "Published",
    questions: [
      {
        id: 1,
        question: "Which CSS system is designed for two-dimensional layouts?",
        options: ["Flexbox", "Grid", "Float", "Inline"],
        correctAnswer: "Grid",
        marks: 2,
      },
      {
        id: 2,
        question: "Which property enables Flexbox?",
        options: [
          "position: flex",
          "display: flex",
          "layout: flex",
          "flex: display",
        ],
        correctAnswer: "display: flex",
        marks: 2,
      },
    ],
  },
  {
    id: 4,
    title: "Node.js Introduction Quiz",
    course: "Node.js & Express",
    duration: 20,
    attempts: 0,
    averageScore: 0,
    status: "Draft",
    questions: [
      {
        id: 1,
        question: "What is Node.js?",
        options: [
          "A JavaScript runtime",
          "A database",
          "A CSS framework",
          "An operating system",
        ],
        correctAnswer: "A JavaScript runtime",
        marks: 2,
      },
    ],
  },
];

function InstructorQuizzes() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [showQuizForm, setShowQuizForm] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<number | null>(null);

  const [quizTitle, setQuizTitle] = useState("");
  const [quizCourse, setQuizCourse] = useState("");
  const [quizDuration, setQuizDuration] = useState("20");
  const [quizStatus, setQuizStatus] =
    useState<"Published" | "Draft">("Draft");

  const [questions, setQuestions] = useState<Question[]>([]);

  const [questionText, setQuestionText] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionMarks, setQuestionMarks] = useState("2");

  const courses = [
    "Complete React & TypeScript",
    "JavaScript Fundamentals",
    "Modern CSS Masterclass",
    "Node.js & Express",
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const resetForm = () => {
    setQuizTitle("");
    setQuizCourse("");
    setQuizDuration("20");
    setQuizStatus("Draft");
    setQuestions([]);
    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");
    setQuestionMarks("2");
    setEditingQuizId(null);
    setShowQuizForm(false);
  };

  const handleAddQuestion = () => {
    if (
      !questionText.trim() ||
      !optionA.trim() ||
      !optionB.trim() ||
      !optionC.trim() ||
      !optionD.trim() ||
      !correctAnswer
    ) {
      alert("Please fill in all question fields.");
      return;
    }

    const newQuestion: Question = {
      id: Date.now(),
      question: questionText,
      options: [optionA, optionB, optionC, optionD],
      correctAnswer,
      marks: Number(questionMarks) || 1,
    };

    setQuestions((prev) => [...prev, newQuestion]);

    setQuestionText("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");
    setQuestionMarks("2");
  };

  const handleRemoveQuestion = (id: number) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== id)
    );
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuizId(quiz.id);
    setQuizTitle(quiz.title);
    setQuizCourse(quiz.course);
    setQuizDuration(String(quiz.duration));
    setQuizStatus(quiz.status);
    setQuestions(quiz.questions);
    setShowQuizForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSaveQuiz = () => {
    if (!quizTitle.trim() || !quizCourse || questions.length === 0) {
      alert(
        "Please enter a quiz title, select a course, and add at least one question."
      );
      return;
    }

    const quizData: Quiz = {
      id: editingQuizId ?? Date.now(),
      title: quizTitle,
      course: quizCourse,
      duration: Number(quizDuration) || 20,
      attempts: editingQuizId
        ? quizzes.find((quiz) => quiz.id === editingQuizId)?.attempts ?? 0
        : 0,
      averageScore: editingQuizId
        ? quizzes.find((quiz) => quiz.id === editingQuizId)
            ?.averageScore ?? 0
        : 0,
      status: quizStatus,
      questions,
    };

    if (editingQuizId) {
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz.id === editingQuizId ? quizData : quiz
        )
      );
      alert("Quiz updated successfully!");
    } else {
      setQuizzes((prev) => [...prev, quizData]);
      alert("Quiz created successfully!");
    }

    resetForm();
  };

  const handleDeleteQuiz = (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?"
    );

    if (!confirmed) return;

    setQuizzes((prev) =>
      prev.filter((quiz) => quiz.id !== id)
    );
  };

  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quiz.course
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCourse =
      selectedCourse === "All Courses" ||
      quiz.course === selectedCourse;

    const matchesStatus =
      selectedStatus === "All Status" ||
      quiz.status === selectedStatus;

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const totalQuestions = quizzes.reduce(
    (total, quiz) => total + quiz.questions.length,
    0
  );

  const publishedQuizzes = quizzes.filter(
    (quiz) => quiz.status === "Published"
  ).length;

  const draftQuizzes = quizzes.filter(
    (quiz) => quiz.status === "Draft"
  ).length;

  const totalAttempts = quizzes.reduce(
    (total, quiz) => total + quiz.attempts,
    0
  );

  return (
    <div className="instructor-quizzes-page">
      {/* SIDEBAR */}
      <aside className="instructor-sidebar">
        <div className="instructor-brand">
          <div className="instructor-brand-icon">L</div>

          <div className="instructor-brand-text">
            <span className="instructor-brand-title">
              LearnHub
            </span>
            <span className="instructor-brand-subtitle">
              Instructor
            </span>
          </div>
        </div>

        <nav className="instructor-navigation">
          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MAIN</span>

            <Link
              to="/instructor/dashboard"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">▦</span>
              <span>Dashboard</span>
            </Link>

            <Link
              to="/instructor/courses"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📚</span>
              <span>My Courses</span>
            </Link>

            <Link
              to="/instructor/courses/create"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">＋</span>
              <span>Create Course</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">MANAGE</span>

            <Link
              to="/instructor/lessons"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📖</span>
              <span>Manage Lessons</span>
            </Link>

            <Link
              to="/instructor/students"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">👥</span>
              <span>Students</span>
            </Link>

            <Link
              to="/instructor/quizzes"
              className="instructor-nav-link active"
            >
              <span className="instructor-nav-icon">📝</span>
              <span>Quizzes</span>
            </Link>

            <Link
              to="/instructor/analytics"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">📊</span>
              <span>Analytics</span>
            </Link>
          </div>

          <div className="instructor-nav-section">
            <span className="instructor-nav-label">ACCOUNT</span>

            <Link
              to="/profile"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">👤</span>
              <span>Profile</span>
            </Link>

            <Link
              to="/settings"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">⚙</span>
              <span>Settings</span>
            </Link>

            <Link
              to="/help"
              className="instructor-nav-link"
            >
              <span className="instructor-nav-icon">?</span>
              <span>Help Center</span>
            </Link>
          </div>
        </nav>

        <div className="instructor-sidebar-bottom">
          <div className="instructor-support-card">
            <div className="instructor-support-icon">💡</div>

            <div>
              <strong>Need help?</strong>
              <span>Visit our Help Center</span>
            </div>
          </div>

          <button
            className="instructor-logout"
            onClick={handleLogout}
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="instructor-main">
        {/* TOPBAR */}
        <header className="instructor-topbar">
          <div className="instructor-breadcrumb">
            <span>Instructor</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Quizzes</strong>
          </div>

          <div className="instructor-topbar-right">
            <button
              className="instructor-notification"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
            >
              🔔
              <span className="notification-dot"></span>
            </button>

            <div className="instructor-profile-wrapper">
              <button
                className="instructor-profile-button"
                onClick={() =>
                  setShowProfileMenu(!showProfileMenu)
                }
              >
                <div className="instructor-avatar">S</div>

                <div className="instructor-user-info">
                  <strong>Supriya Enjam</strong>
                  <span>Instructor</span>
                </div>

                <span className="profile-chevron">⌄</span>
              </button>

              {showProfileMenu && (
                <div className="instructor-profile-menu">
                  <Link to="/profile">My Profile</Link>
                  <Link to="/settings">Settings</Link>

                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="instructor-content">
          {/* HEADER */}
          <section className="quizzes-page-header">
            <div>
              <span className="welcome-label">
                QUIZ MANAGEMENT
              </span>

              <h1>Manage Quizzes</h1>

              <p>
                Create assessments, manage questions, and track
                student quiz performance.
              </p>
            </div>

            <button
              className="create-quiz-button"
              onClick={() => {
                resetForm();
                setShowQuizForm(true);
              }}
            >
              <span>＋</span>
              Create Quiz
            </button>
          </section>

          {/* STATISTICS */}
          <section className="quiz-stats">
            <div className="quiz-stat-card">
              <div className="quiz-stat-icon total">📝</div>

              <div>
                <span>Total Quizzes</span>
                <strong>{quizzes.length}</strong>
              </div>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon published">
                ✓
              </div>

              <div>
                <span>Published</span>
                <strong>{publishedQuizzes}</strong>
              </div>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon draft">📄</div>

              <div>
                <span>Drafts</span>
                <strong>{draftQuizzes}</strong>
              </div>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon attempts">👥</div>

              <div>
                <span>Total Attempts</span>
                <strong>{totalAttempts}</strong>
              </div>
            </div>

            <div className="quiz-stat-card">
              <div className="quiz-stat-icon questions">❓</div>

              <div>
                <span>Total Questions</span>
                <strong>{totalQuestions}</strong>
              </div>
            </div>
          </section>

          {/* CREATE / EDIT FORM */}
          {showQuizForm && (
            <section className="quiz-form-panel">
              <div className="quiz-form-header">
                <div>
                  <span className="panel-label">
                    {editingQuizId
                      ? "EDIT QUIZ"
                      : "NEW QUIZ"}
                  </span>

                  <h2>
                    {editingQuizId
                      ? "Edit Quiz"
                      : "Create New Quiz"}
                  </h2>
                </div>

                <button
                  className="close-form-button"
                  onClick={resetForm}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="quiz-basic-fields">
                <div className="form-group">
                  <label>Quiz Title</label>

                  <input
                    type="text"
                    value={quizTitle}
                    onChange={(event) =>
                      setQuizTitle(event.target.value)
                    }
                    placeholder="Enter quiz title"
                  />
                </div>

                <div className="form-group">
                  <label>Course</label>

                  <select
                    value={quizCourse}
                    onChange={(event) =>
                      setQuizCourse(event.target.value)
                    }
                  >
                    <option value="">
                      Select Course
                    </option>

                    {courses.map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>

                  <input
                    type="number"
                    min="1"
                    value={quizDuration}
                    onChange={(event) =>
                      setQuizDuration(event.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Status</label>

                  <select
                    value={quizStatus}
                    onChange={(event) =>
                      setQuizStatus(
                        event.target.value as
                          | "Published"
                          | "Draft"
                      )
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">
                      Published
                    </option>
                  </select>
                </div>
              </div>

              {/* ADD QUESTION */}
              <div className="question-builder">
                <div className="question-builder-header">
                  <div>
                    <span className="panel-label">
                      QUESTION BUILDER
                    </span>

                    <h3>Add Questions</h3>
                  </div>

                  <span className="question-count">
                    {questions.length} question
                    {questions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="question-form">
                  <div className="form-group full-width">
                    <label>Question</label>

                    <textarea
                      value={questionText}
                      onChange={(event) =>
                        setQuestionText(event.target.value)
                      }
                      placeholder="Enter your question"
                      rows={3}
                    />
                  </div>

                  <div className="options-grid">
                    <div className="form-group">
                      <label>Option A</label>

                      <input
                        type="text"
                        value={optionA}
                        onChange={(event) =>
                          setOptionA(event.target.value)
                        }
                        placeholder="Enter option A"
                      />
                    </div>

                    <div className="form-group">
                      <label>Option B</label>

                      <input
                        type="text"
                        value={optionB}
                        onChange={(event) =>
                          setOptionB(event.target.value)
                        }
                        placeholder="Enter option B"
                      />
                    </div>

                    <div className="form-group">
                      <label>Option C</label>

                      <input
                        type="text"
                        value={optionC}
                        onChange={(event) =>
                          setOptionC(event.target.value)
                        }
                        placeholder="Enter option C"
                      />
                    </div>

                    <div className="form-group">
                      <label>Option D</label>

                      <input
                        type="text"
                        value={optionD}
                        onChange={(event) =>
                          setOptionD(event.target.value)
                        }
                        placeholder="Enter option D"
                      />
                    </div>
                  </div>

                  <div className="question-options-row">
                    <div className="form-group">
                      <label>Correct Answer</label>

                      <select
                        value={correctAnswer}
                        onChange={(event) =>
                          setCorrectAnswer(event.target.value)
                        }
                      >
                        <option value="">
                          Select Correct Answer
                        </option>

                        <option value={optionA}>
                          Option A
                        </option>

                        <option value={optionB}>
                          Option B
                        </option>

                        <option value={optionC}>
                          Option C
                        </option>

                        <option value={optionD}>
                          Option D
                        </option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Marks</label>

                      <input
                        type="number"
                        min="1"
                        value={questionMarks}
                        onChange={(event) =>
                          setQuestionMarks(event.target.value)
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="add-question-button"
                      onClick={handleAddQuestion}
                    >
                      + Add Question
                    </button>
                  </div>
                </div>

                {/* QUESTION LIST */}
                {questions.length > 0 && (
                  <div className="added-questions">
                    <h4>Added Questions</h4>

                    {questions.map((question, index) => (
                      <div
                        className="added-question"
                        key={question.id}
                      >
                        <div className="question-number">
                          {index + 1}
                        </div>

                        <div className="added-question-content">
                          <strong>
                            {question.question}
                          </strong>

                          <div className="question-options">
                            {question.options.map(
                              (option, optionIndex) => (
                                <span
                                  key={`${question.id}-${optionIndex}`}
                                  className={
                                    option ===
                                    question.correctAnswer
                                      ? "correct-option"
                                      : ""
                                  }
                                >
                                  {String.fromCharCode(
                                    65 + optionIndex
                                  )}
                                  . {option}
                                  {option ===
                                    question.correctAnswer &&
                                    " ✓"}
                                </span>
                              )
                            )}
                          </div>

                          <small>
                            {question.marks} mark
                            {question.marks !== 1
                              ? "s"
                              : ""}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="remove-question-button"
                          onClick={() =>
                            handleRemoveQuestion(question.id)
                          }
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="quiz-form-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="save-quiz-button"
                  onClick={handleSaveQuiz}
                >
                  {editingQuizId
                    ? "Update Quiz"
                    : "Save Quiz"}
                </button>
              </div>
            </section>
          )}

          {/* FILTERS */}
          <section className="quiz-filter-panel">
            <div className="quiz-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search quizzes or courses..."
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>

            <div className="quiz-filter-group">
              <label>Course</label>

              <select
                value={selectedCourse}
                onChange={(event) =>
                  setSelectedCourse(event.target.value)
                }
              >
                <option>All Courses</option>

                {courses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div className="quiz-filter-group">
              <label>Status</label>

              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value)
                }
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>
            </div>
          </section>

          {/* QUIZ LIST */}
          <section className="quizzes-panel">
            <div className="quizzes-panel-header">
              <div>
                <span className="panel-label">ASSESSMENTS</span>
                <h2>Your Quizzes</h2>
              </div>

              <span className="quiz-result-count">
                {filteredQuizzes.length} quiz
                {filteredQuizzes.length !== 1 ? "zes" : ""}
              </span>
            </div>

            {filteredQuizzes.length > 0 ? (
              <div className="quiz-list">
                {filteredQuizzes.map((quiz) => (
                  <article
                    className="quiz-card"
                    key={quiz.id}
                  >
                    <div className="quiz-card-icon">
                      📝
                    </div>

                    <div className="quiz-card-content">
                      <div className="quiz-card-top">
                        <span className="quiz-course">
                          {quiz.course}
                        </span>

                        <span
                          className={`quiz-status ${quiz.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {quiz.status}
                        </span>
                      </div>

                      <h3>{quiz.title}</h3>

                      <div className="quiz-meta">
                        <span>
                          ❓ {quiz.questions.length} questions
                        </span>

                        <span>
                          ⏱ {quiz.duration} minutes
                        </span>

                        <span>
                          👥 {quiz.attempts} attempts
                        </span>

                        {quiz.averageScore > 0 && (
                          <span>
                            ⭐ {quiz.averageScore}% average
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="quiz-card-actions">
                      <button
                        className="quiz-edit-button"
                        onClick={() =>
                          handleEditQuiz(quiz)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="quiz-delete-button"
                        onClick={() =>
                          handleDeleteQuiz(quiz.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="quiz-empty-state">
                <div>🔎</div>

                <h3>No quizzes found</h3>

                <p>
                  Try changing your search or filters, or create
                  a new quiz.
                </p>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCourse("All Courses");
                    setSelectedStatus("All Status");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </section>

          {/* INFO BANNER */}
          <section className="quiz-info-banner">
            <div className="quiz-info-icon">💡</div>

            <div>
              <strong>Quiz management</strong>

              <p>
                Create quizzes for your courses, add multiple
                questions, set correct answers, and monitor
                student attempts. Quiz data will later be
                connected to the backend API.
              </p>
            </div>
          </section>
        </div>

        {/* FOOTER */}
        <footer className="instructor-footer">
          <div>
            <strong>LearnHub</strong>

            <span>
              © 2026 LearnHub. All rights reserved.
            </span>
          </div>

          <div className="instructor-footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/settings">Settings</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default InstructorQuizzes;
