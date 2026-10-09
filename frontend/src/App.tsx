import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ThemeToggle } from "./components/ThemeToggle";

// Landing & Authentication
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";

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
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Notifications from "./pages/Notifications";

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
import InstructorNotifications from "./pages/InstructorNotifications";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";

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
  const {
    isAuthenticated,
    isMentor,
    isAdmin,
  } = useAuth();

  const location = useLocation();

  // -------------------------------------------------------
  // User is not logged in
  // -------------------------------------------------------
  if (!isAuthenticated) {
    const from = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to="/login"
        replace
        state={{ from }}
      />
    );
  }

  // -------------------------------------------------------
  // Mentor / Instructor pages
  //
  // Admin users are also allowed to access
  // mentor/instructor pages.
  // -------------------------------------------------------
  if (
    requireRole === "mentor" &&
    !isMentor &&
    !isAdmin
  ) {
    return (
      <Navigate
        to="/student/dashboard"
        replace
      />
    );
  }

  // -------------------------------------------------------
  // Admin pages
  // -------------------------------------------------------
  if (
    requireRole === "admin" &&
    !isAdmin
  ) {
    return (
      <Navigate
        to="/student/dashboard"
        replace
      />
    );
  }

  return <>{children}</>;
};

/* =========================================================
   REDIRECT HELPERS
   Legacy /mentor/* URLs -> /instructor/*
========================================================= */

const MentorCourseRedirect = ({
  suffix,
}: {
  suffix: "edit" | "students";
}) => {
  const { id } = useParams();

  const target =
    suffix === "students"
      ? `/instructor/students?course=${id}`
      : `/instructor/courses/edit/${id}`;

  return (
    <Navigate
      to={target}
      replace
    />
  );
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

      <Route
        path="/"
        element={<LandingPage />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password/:token"
        element={<ResetPassword />}
      />

      <Route
        path="/terms"
        element={<TermsAndConditions />}
      />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />

      <Route
        path="/courses"
        element={<Courses />}
      />

      <Route
        path="/courses/:id"
        element={<CourseDetails />}
      />

      <Route
        path="/discover"
        element={<Discover />}
      />

      {/* =====================================================
          INSTRUCTOR LOGIN
          PUBLIC
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
        path="/achievements"
        element={
          <ProtectedRoute>
            <Achievements />
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
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
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

      <Route
        path="/instructor/notifications"
        element={
          <ProtectedRoute requireRole="mentor">
            <InstructorNotifications />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ADMIN ROUTES

          AdminLayout stays mounted while the child page
          changes inside <Outlet />.
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute requireRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        {/* Admin Users */}
        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

        {/* Admin Courses */}
        <Route
          path="/admin/courses"
          element={<AdminCourses />}
        />

        {/* Admin Mentors */}
        <Route
          path="/admin/mentors"
          element={<AdminMentors />}
        />

        {/* Admin Enrollments */}
        <Route
          path="/admin/enrollments"
          element={<AdminEnrollments />}
        />

        {/* Admin Analytics */}
        <Route
          path="/admin/analytics"
          element={<AdminAnalytics />}
        />

        {/* Admin Profile */}
        <Route
          path="/admin/profile"
          element={<AdminProfile />}
        />

        {/* Admin Settings */}
        <Route
          path="/admin/settings"
          element={<AdminSettings />}
        />

      </Route>

      {/* =====================================================
          LEGACY /mentor/* URLS
          Redirect to /instructor/*
      ===================================================== */}

      <Route
        path="/mentor/dashboard"
        element={
          <Navigate
            to="/instructor/dashboard"
            replace
          />
        }
      />

      <Route
        path="/mentor/courses"
        element={
          <Navigate
            to="/instructor/courses"
            replace
          />
        }
      />

      <Route
        path="/mentor/courses/new"
        element={
          <Navigate
            to="/instructor/courses/create"
            replace
          />
        }
      />

      <Route
        path="/mentor/courses/:id/edit"
        element={
          <MentorCourseRedirect
            suffix="edit"
          />
        }
      />

      <Route
        path="/mentor/courses/:id/students"
        element={
          <MentorCourseRedirect
            suffix="students"
          />
        }
      />

      {/* =====================================================
          FALLBACK
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ThemeToggle />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;