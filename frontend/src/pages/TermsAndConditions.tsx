import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function TermsAndConditions() {
  return (
    <div className="landing-page" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <Navbar />
      
      <div style={{ maxWidth: "800px", margin: "60px auto", background: "white", padding: "50px", borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #eef0f4" }}>
        
        <div style={{ marginBottom: "40px", textAlign: "center", borderBottom: "1px solid #eef0f4", paddingBottom: "30px" }}>
          <h1 style={{ color: "#111827", fontSize: "36px", fontWeight: "800", marginBottom: "12px", letterSpacing: "-1px" }}>Terms and Conditions</h1>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Last updated: October 2026</p>
        </div>

        <div style={{ color: "#4b5563", lineHeight: "1.8", fontSize: "16px" }}>
          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>1. Introduction</h2>
          <p style={{ marginBottom: "18px" }}>
            Welcome to Eduverse. These Terms and Conditions govern your use of our website, platform, and services. By accessing or using Eduverse, you agree to be bound by these terms. If you disagree with any part of the terms, you may not access our services.
          </p>

          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>2. User Accounts</h2>
          <p style={{ marginBottom: "18px" }}>
            When you create an account with us, you must provide accurate, complete, and current information at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our platform.
          </p>
          <p style={{ marginBottom: "18px" }}>
            You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
          </p>

          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>3. Course Enrollment and Access</h2>
          <p style={{ marginBottom: "18px" }}>
            When you enroll in a course, you are granted a limited, non-exclusive, non-transferable license to access and view the course content for which you have paid all required fees, solely for your personal, non-commercial, educational purposes through the Services.
          </p>
          
          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>4. Instructor Obligations</h2>
          <p style={{ marginBottom: "18px" }}>
            Instructors on Eduverse retain ownership of their content but grant Eduverse a license to host, share, and monetize the content on the platform. Instructors must ensure that their content does not infringe on any third-party intellectual property rights.
          </p>

          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>5. Termination</h2>
          <p style={{ marginBottom: "18px" }}>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>

          <h2 style={{ color: "#111827", fontSize: "22px", marginTop: "35px", marginBottom: "15px", fontWeight: "700", letterSpacing: "-0.5px" }}>6. Changes to Terms</h2>
          <p style={{ marginBottom: "18px" }}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
          </p>
          
          <div style={{ marginTop: "60px", paddingTop: "30px", borderTop: "1px solid #eef0f4", textAlign: "center" }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "12px 24px", background: "#2563eb", color: "white", borderRadius: "8px", fontWeight: "600", textDecoration: "none", transition: "all 0.2s", boxShadow: "0 4px 14px rgba(37,99,235,0.2)" }}>
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
