
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Landing & Authentication
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Student Pages
import StudentDashboard from "./pages/StudentDashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import Discover from "./pages/Discover";
import Quizzes from "./pages/Quizzes";
import Progress from "./pages/Progress";
import Activities from "./pages/Activities";
import Learn from "./pages/Learn";
import MyCourses from "./pages/MyCourses";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Instructor Pages
import InstructorLogin from "./pages/InstructorLogin";
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourses from "./pages/InstructorCourses";
import CreateCourse from "./pages/CreateCourse";
import CourseEditor from "./pages/CourseEditor";
import ManageLessons from "./pages/ManageLessons";
import InstructorStudents from "./pages/InstructorStudents";
import InstructorQuizzes from "./pages/InstructorQuizzes";
import InstructorAnalytics from "./pages/InstructorAnalytics";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorSettings from "./pages/InstructorSettings";

import "./index.css";

/* =========================================================
   PROTECTED ROUTE
========================================================= */

const ProtectedRoute = ({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "mentor" | "admin" | "student";
}) => {
  const { isAuthenticated, isMentor, isAdmin } = useAuth();

  // User is not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mentor/instructor pages
  if (requireRole === "mentor" && !isMentor && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  // Admin pages
  if (requireRole === "admin" && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

/* =========================================================
   ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>
      {/* =====================================================
          PUBLIC PAGES
      ===================================================== */}

      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/courses" element={<Courses />} />

      <Route path="/courses/:id" element={<CourseDetails />} />

      <Route path="/discover" element={<Discover />} />

      {/* =====================================================
          INSTRUCTOR LOGIN
          This page must remain PUBLIC
      ===================================================== */}

      <Route
        path="/instructor/login"
        element={<InstructorLogin />}
      />

      {/* =====================================================
          STUDENT ROUTES
      ===================================================== */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/quizzes"
        element={
          <ProtectedRoute>
            <Quizzes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/progress"
        element={
          <ProtectedRoute>
            <Progress />
          </ProtectedRoute>
        }
      />

      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Activities />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn"
        element={
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        }
      />

      <Route
        path="/learn/:id"
        element={
          <ProtectedRoute>
            <Learn />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/courses"
        element={
          <ProtectedRoute>
            <MyCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/help"
        element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          INSTRUCTOR ROUTES
      ===================================================== */}

      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/create"
        element={
          <ProtectedRoute requireRole="mentor">
            <CreateCourse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/edit/:id"
        element={
          <ProtectedRoute requireRole="mentor">
            <CourseEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/:id/edit"
        element={
          <ProtectedRoute requireRole="mentor">
            <CourseEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/:id"
        element={
          <ProtectedRoute requireRole="mentor">
            <CourseEditor />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/lessons"
        element={
          <ProtectedRoute requireRole="mentor">
            <ManageLessons />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/students"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorStudents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/quizzes"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorQuizzes />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/analytics"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorAnalytics />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/profile"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/settings"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorSettings />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          MENTOR ALIASES
      ===================================================== */}

      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/courses"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorCourses />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/courses/new"
        element={
          <ProtectedRoute requireRole="mentor">
            <CreateCourse />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor/courses/:id/edit"
        element={
          <ProtectedRoute requireRole="mentor">
            <CourseEditor />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
};

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
