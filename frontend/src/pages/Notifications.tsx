import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api";
import StudentLayout from "../components/StudentLayout";
import { timeAgo } from "../utils/format";

function Notifications() {
  const [items, setItems] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (pageNumber: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await api.notifications.getAll(pageNumber, "student");
      setItems(res.data || []);
      setUnread(res.unreadCount || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(getErrorMessage(err, "Could not load notifications."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const markRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setItems((current) => current.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnread((count) => Math.max(0, count - 1));
    } catch (err) {
      setError(getErrorMessage(err, "Could not update the notification."));
    }
  };

  const markAll = async () => {
    try {
      await api.notifications.markAllAsRead("student");
      setItems((current) => current.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update notifications."));
    }
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 20,
  };

  return (
    <StudentLayout activeItem="notifications" searchPlaceholder="Search...">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#4f46e5" }}>
            UPDATES
          </span>
          <h1 style={{ margin: "4px 0", fontSize: 26, color: "#111827" }}>Notifications</h1>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            {unread > 0
              ? `${unread} unread notification${unread === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
        </div>

        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            style={{
              padding: "9px 16px",
              borderRadius: 10,
              border: "1px solid #d1d5db",
              background: "#fff",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: "11px 14px",
            borderRadius: 10,
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <section style={card}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>Loading notifications...</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 10px", color: "#6b7280" }}>
            <span style={{ fontSize: 34, display: "block", marginBottom: 8 }}>🔔</span>
            <strong style={{ color: "#111827" }}>No notifications yet</strong>
            <p style={{ fontSize: 13 }}>Updates about your courses will show up here.</p>
          </div>
        ) : (
          items.map((n) => (
            <div
              key={n._id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "#111827", fontWeight: n.isRead ? 500 : 800 }}>
                  {n.message}
                </strong>
                <small style={{ color: "#6b7280" }}>
                  {n.course?.title ? `${n.course.title} · ` : ""}
                  {timeAgo(n.createdAt)}
                </small>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  onClick={() => markRead(n._id)}
                  style={{
                    padding: "6px 11px",
                    borderRadius: 8,
                    border: "1px solid #d1d5db",
                    background: "#fff",
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16, alignItems: "center" }}>
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ← Previous
          </button>
          <span style={{ fontSize: 13 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </StudentLayout>
  );
}

export default Notifications;
