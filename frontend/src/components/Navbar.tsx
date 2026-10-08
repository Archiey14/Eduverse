
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };

  return (
    <header className="landing-navbar">
      <div className="landing-container navbar-inner">

        {/* ================================
            LOGO
        ================================= */}
        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">L</span>
          <span>Eduverse</span>
        </Link>

        {/* ================================
            NAVIGATION
        ================================= */}
        <nav className="landing-nav-links">

          {/* Home */}
          <Link
            to="/"
            className={isActive("/") ? "active" : ""}
          >
            Home
          </Link>

          {/* Discover */}
          <Link
            to="/discover"
            className={isActive("/discover") ? "active" : ""}
          >
            Discover
          </Link>

          {/* Courses */}
          <Link
            to="/courses"
            className={isActive("/courses") ? "active" : ""}
          >
            Courses
          </Link>

          {/* ================================
              INSTRUCTOR LOGIN
          ================================= */}
          <Link
            to="/instructor/login"
            className={
              isActive("/instructor/login")
                ? "active instructor-login-link"
                : "instructor-login-link"
            }
          >
            Instructor Login
          </Link>

          {/* ================================
              STUDENT LOGIN
          ================================= */}
          <Link
            to="/login"
            className={
              isActive("/login")
                ? "active navbar-login-link"
                : "navbar-login-link"
            }
          >
            Login
          </Link>

          {/* ================================
              GET STARTED
          ================================= */}
          <Link
            to="/register"
            className="navbar-register-btn"
          >
            Get Started
            <span className="navbar-btn-arrow">→</span>
          </Link>

        </nav>
      </div>
    </header>
  );
};

export default Navbar;
