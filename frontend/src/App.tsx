
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
import Learn from "./pages/Learn";
import MyCourses from "./pages/MyCourses";

// Student Pages - Existing
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing & Authentication */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetails />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/my-courses" element={<MyCourses />} />

        {/* Existing Student Routes */}
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

        {/* Instructor Routes */}
        <Route
          path="/instructor/dashboard"
          element={<InstructorDashboard />}
        />

        <Route
          path="/instructor/courses"
          element={<InstructorCourses />}
        />

        <Route
          path="/instructor/courses/create"
          element={<CreateCourse />}
        />

        <Route
          path="/instructor/lessons"
          element={<ManageLessons />}
        />

        <Route
          path="/instructor/students"
          element={<InstructorStudents />}
        />

        <Route
          path="/instructor/quizzes"
          element={<InstructorQuizzes />}
        />

        <Route
          path="/instructor/analytics"
          element={<InstructorAnalytics />}
        />

        <Route
          path="/instructor/profile"
          element={<InstructorProfile />}
        />

        <Route
          path="/instructor/settings"
          element={<InstructorSettings />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
