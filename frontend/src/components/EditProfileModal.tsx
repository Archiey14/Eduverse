import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { api, getErrorMessage } from "../services/api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.auth.updateMe({ name });
      if (res.user) {
        updateUser(res.user);
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#111827" }}>Edit Profile</h2>
          <button onClick={onClose} style={closeButtonStyle}>×</button>
        </div>
        
        {error && <p style={{ color: "#ef4444", fontSize: "0.875rem", marginBottom: "1rem" }}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
              Full Name
            </label>
            <input 
              type="text" 
              value={name || ""} 
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancel</button>
            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(4px)",
  zIndex: 9999,
  display: "flex", justifyContent: "center", alignItems: "center"
};

const modalContentStyle: React.CSSProperties = {
  background: "#ffffff", padding: "1.5rem", borderRadius: "0.75rem", 
  width: "400px", maxWidth: "90%",
  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem"
};

const closeButtonStyle: React.CSSProperties = {
  background: "none", border: "none", fontSize: "1.5rem", color: "#6b7280", 
  cursor: "pointer", padding: "0 0.25rem", lineHeight: 1
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.625rem", borderRadius: "0.375rem", 
  border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#111827",
  outline: "none", boxSizing: "border-box"
};

const btnSecondary: React.CSSProperties = {
  padding: "0.625rem 1rem", border: "1px solid #d1d5db", background: "#ffffff", 
  color: "#374151", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer"
};

const btnPrimary: React.CSSProperties = {
  padding: "0.625rem 1rem", border: "none", background: "#4f46e5", 
  color: "#ffffff", borderRadius: "0.375rem", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer"
};
