
import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Achievements from "./pages/Achievements";
import Wishlist from "./pages/Wishlist";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Help from "./pages/Help";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Landing Page
        ========================= */}
        <Route
          path="/"
          element={<LandingPage />}
        />

        {/* =========================
            Authentication
        ========================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            Student Dashboard
        ========================= */}
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        {/* =========================
            Courses
        ========================= */}
        <Route
          path="/courses"
          element={<Courses />}
        />

        {/* Course Details
            Example: /courses/1
        */}
        <Route
          path="/courses/:id"
          element={<CourseDetails />}
        />

        {/* =========================
            Discover
        ========================= */}
        <Route
          path="/discover"
          element={<Discover />}
        />

        {/* =========================
            Quizzes
        ========================= */}
        <Route
          path="/quizzes"
          element={<Quizzes />}
        />

        {/* =========================
            Progress
        ========================= */}
        <Route
          path="/progress"
          element={<Progress />}
        />

        {/* =========================
            Learning Activities
        ========================= */}
        <Route
          path="/activities"
          element={<Activities />}
        />

        {/* =========================
            Achievements
        ========================= */}
        <Route
          path="/achievements"
          element={<Achievements />}
        />

        {/* =========================
            Wishlist
        ========================= */}
        <Route
          path="/wishlist"
          element={<Wishlist />}
        />

        {/* =========================
            Profile
        ========================= */}
        <Route
          path="/profile"
          element={<Profile />}
        />

        {/* =========================
            Settings
        ========================= */}
        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* =========================
            Help & Support
        ========================= */}
        <Route
          path="/help"
          element={<Help />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
