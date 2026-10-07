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
import Achievements from "./pages/Achievements";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Instructor Pages
import InstructorDashboard from "./pages/InstructorDashboard";
import InstructorCourses from "./pages/InstructorCourses";
import CreateCourse from "./pages/CreateCourse";
import ManageLessons from "./pages/ManageLessons";
import InstructorStudents from "./pages/InstructorStudents";
import InstructorQuizzes from "./pages/InstructorQuizzes";
import InstructorAnalytics from "./pages/InstructorAnalytics";
import InstructorProfile from "./pages/InstructorProfile";
import InstructorSettings from "./pages/InstructorSettings";

import "./index.css";

// Protected Route Component
const ProtectedRoute = ({
  children,
  requireRole,
}: {
  children: React.ReactNode;
  requireRole?: "mentor" | "admin" | "student";
}) => {
  const { isAuthenticated, isMentor, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole === "mentor" && !isMentor && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  if (requireRole === "admin" && !isAdmin) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      <Route path="/discover" element={<Discover />} />

      {/* Protected Student Routes */}
      <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
      <Route path="/quizzes" element={<ProtectedRoute><Quizzes /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
      <Route path="/activities" element={<ProtectedRoute><Activities /></ProtectedRoute>} />
      <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
      <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

      {/* Protected Instructor Routes */}
      <Route path="/instructor/dashboard" element={<ProtectedRoute requireRole="mentor"><InstructorDashboard /></ProtectedRoute>} />
      <Route path="/instructor/courses" element={<ProtectedRoute requireRole="mentor"><InstructorCourses /></ProtectedRoute>} />
      <Route path="/instructor/courses/create" element={<ProtectedRoute requireRole="mentor"><CreateCourse /></ProtectedRoute>} />
      <Route path="/instructor/lessons" element={<ProtectedRoute requireRole="mentor"><ManageLessons /></ProtectedRoute>} />
      <Route path="/instructor/students" element={<ProtectedRoute requireRole="mentor"><InstructorStudents /></ProtectedRoute>} />
      <Route path="/instructor/quizzes" element={<ProtectedRoute requireRole="mentor"><InstructorQuizzes /></ProtectedRoute>} />
      <Route path="/instructor/analytics" element={<ProtectedRoute requireRole="mentor"><InstructorAnalytics /></ProtectedRoute>} />
      <Route path="/instructor/profile" element={<ProtectedRoute requireRole="mentor"><InstructorProfile /></ProtectedRoute>} />
      <Route path="/instructor/settings" element={<ProtectedRoute requireRole="mentor"><InstructorSettings /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

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
