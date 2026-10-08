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
import Achievements from "./pages/Achievements";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

// Instructor Pages
import MentorDashboard from "./pages/MentorDashboard";
import MentorCourses from "./pages/MentorCourses";
import CourseEditor from "./pages/CourseEditor";

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
      <Route path="/student/courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
      <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
      <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />

      {/* Protected Mentor Studio Routes */}
      <Route path="/mentor" element={<Navigate to="/mentor/dashboard" replace />} />
      <Route path="/mentor/dashboard" element={<ProtectedRoute requireRole="mentor"><MentorDashboard /></ProtectedRoute>} />
      <Route path="/mentor/courses" element={<ProtectedRoute requireRole="mentor"><MentorCourses /></ProtectedRoute>} />
      <Route path="/mentor/courses/new" element={<ProtectedRoute requireRole="mentor"><CourseEditor /></ProtectedRoute>} />
      <Route path="/mentor/courses/:id/edit" element={<ProtectedRoute requireRole="mentor"><CourseEditor /></ProtectedRoute>} />
      <Route path="/mentor/courses/:id/students" element={<ProtectedRoute requireRole="mentor"><MentorCourses /></ProtectedRoute>} />

      {/* Legacy Instructor URLs */}
      <Route path="/instructor/dashboard" element={<Navigate to="/mentor/dashboard" replace />} />
      <Route path="/instructor/courses" element={<Navigate to="/mentor/courses" replace />} />
      <Route path="/instructor/courses/create" element={<Navigate to="/mentor/courses/new" replace />} />
      <Route path="/instructor/*" element={<Navigate to="/mentor/dashboard" replace />} />

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
