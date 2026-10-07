import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./shared.css";

interface MobileNavProps {
  /** Viewport width (px) below which the page's own sidebar is hidden. */
  breakpoint?: 900 | 1050;
}

/**
 * Compact top navigation shown only on screens where a page hides its sidebar,
 * so phone users are never left without navigation.
 */
function MobileNav({ breakpoint = 900 }: MobileNavProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isMentor, logout } = useAuth();

  const links = [
    { to: "/student/dashboard", label: "Dashboard" },
    { to: "/courses", label: "Courses" },
    { to: "/discover", label: "Discover" },
    { to: "/quizzes", label: "Quizzes" },
    { to: "/progress", label: "Progress" },
    { to: "/activities", label: "Activities" },
    { to: "/notifications", label: "Notifications" },
  ];

  if (isMentor) {
    links.push({ to: "/mentor", label: "Mentor Studio" });
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      className={`mobile-nav mobile-nav-${breakpoint}`}
      aria-label="Main navigation"
    >
      <Link to="/" className="mobile-nav-brand">
        <span>E</span>
        <span>Eduverse</span>
      </Link>

      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={pathname === link.to ? "active" : ""}
        >
          {link.label}
        </Link>
      ))}

      {isAuthenticated ? (
        <button
          type="button"
          className="mobile-nav-logout"
          onClick={handleLogout}
        >
          Logout
        </button>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </nav>
  );
}

export default MobileNav;
