import React, { useState } from "react";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import "../pages/StudentDashboard.css";

interface StudentLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  className?: string;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  children,
  activeItem,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search courses, lessons...",
  className = "",
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`student-dashboard ${className}`}>
      {sidebarOpen && (
        <div
          className="dashboard-overlay"
          style={{ display: "block" }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <StudentSidebar
        activeItem={activeItem}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="dashboard-main">
        <StudentTopbar
          onOpenSidebar={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
        />
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
};

export default StudentLayout;
