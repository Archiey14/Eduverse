import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "../services/api";
import InstructorLayout from "../components/InstructorLayout";

function InstructorNotifications() {
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
      const res = await api.notifications.getAll(pageNumber, "mentor");
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
      await api.notifications.markAllAsRead("mentor");
      setItems((current) => current.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch (err) {
      setError(getErrorMessage(err, "Could not update notifications."));
    }
  };

  return (
    <InstructorLayout active="notifications" title="Notifications">
      <div className="il-page-header">
        <div>
          <span className="il-eyebrow">UPDATES</span>
          <h1>Notifications</h1>
          <p>{unread > 0 ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "You're all caught up."}</p>
        </div>

        {unread > 0 && (
          <button type="button" className="il-btn il-btn-outline" onClick={markAll}>
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="il-alert il-alert-error">{error}</div>}

      <section className="il-card">
        {loading ? (
          <div className="il-loading">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="il-empty">
            <span>🔔</span>
            <h3>No notifications yet</h3>
            <p>You'll see enrollments, reviews and course updates here.</p>
          </div>
        ) : (
          items.map((n) => (
            <div className="il-list-item" key={n._id}>
              <div>
                <strong style={{ fontWeight: n.isRead ? 500 : 800 }}>{n.message}</strong>
                <small>
                  {n.course?.title ? `${n.course.title} · ` : ""}
                  {new Date(n.createdAt).toLocaleString()}
                </small>
              </div>
              {!n.isRead && (
                <button
                  type="button"
                  className="il-btn il-btn-outline il-btn-sm"
                  onClick={() => markRead(n._id)}
                >
                  Mark read
                </button>
              )}
            </div>
          ))
        )}
      </section>

      {totalPages > 1 && (
        <div className="il-toolbar" style={{ justifyContent: "center" }}>
          <button
            type="button"
            className="il-btn il-btn-outline il-btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span style={{ fontSize: 13 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="il-btn il-btn-outline il-btn-sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </InstructorLayout>
  );
}

export default InstructorNotifications;
