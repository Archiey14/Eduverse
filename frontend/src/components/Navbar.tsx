import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  return (
    <header className="landing-navbar">
      <div className="landing-container navbar-inner">
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">L</span>
          <span>LearnHub</span>
        </Link>

        <nav className="landing-nav-links">
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Home
          </Link>
          <Link
            to="/discover"
            className={location.pathname === "/discover" ? "active" : ""}
          >
            Discover
          </Link>
          <Link
            to="/courses"
            className={location.pathname === "/courses" ? "active" : ""}
          >
            Courses
          </Link>

          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className={location.pathname === "/login" ? "active" : ""}
              >
                Login
              </Link>
              <Link to="/register" className="navbar-register-btn">
                Get Started
              </Link>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Link
                to="/student/dashboard"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#4f46e5",
                  textDecoration: "none",
                }}
              >
                Go to Dashboard →
              </Link>
              <div
                className="dashboard-avatar"
                style={{
                  width: "36px",
                  height: "36px",
                  fontSize: "14px",
                  margin: 0,
                  background: "#4f46e5",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontWeight: "bold",
                }}
                title={user?.name || "Student"}
              >
                {user?.name?.charAt(0).toUpperCase() || "S"}
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
