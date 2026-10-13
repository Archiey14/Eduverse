import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, X } from "lucide-react";
import { useAuth } from "./AuthContext";
import { api } from "../services/api";
import { connectMessagingSocket } from "../services/socket";
import "../components/NotificationToast.css";

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: "notification" | "message";
  avatar?: string;
  link?: string;
  timestamp: Date;
}

interface NotificationContextType {
  unreadNotifications: number;
  unreadMessages: number;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;
  setUnreadMessages: React.Dispatch<React.SetStateAction<number>>;
  refreshNotifications: () => Promise<void>;
  showToast: (toast: Omit<ToastItem, "id" | "timestamp">) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Optional Web Audio synthesized subtle chime so no assets or audio files are needed
const playNotificationSound = (type: "notification" | "message") => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === "notification") {
      // Pleasant two-tone chime for general notification / enrollment
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime + 0.15);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Soft single pop for new chat message
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    }
  } catch {
    // Audio context may be restricted by autoplay policy before user interaction
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token, isMentor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const recentlySeenRef = React.useRef<Map<string, number>>(new Map());
  const userRef = React.useRef(user);
  userRef.current = user;
  const isMentorRef = React.useRef(isMentor);
  isMentorRef.current = isMentor;
  const locationRef = React.useRef(location.pathname);
  locationRef.current = location.pathname;

  const isDuplicateEvent = useCallback((key: string, cooldownMs = 5000): boolean => {
    const now = Date.now();
    const lastTime = recentlySeenRef.current.get(key);
    if (lastTime && now - lastTime < cooldownMs) {
      return true;
    }
    recentlySeenRef.current.set(key, now);

    // Keep memory clean
    if (recentlySeenRef.current.size > 100) {
      for (const [k, v] of recentlySeenRef.current.entries()) {
        if (now - v > 30000) {
          recentlySeenRef.current.delete(k);
        }
      }
    }
    return false;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, "id" | "timestamp">) => {
      setToasts((prev) => {
        // Prevent duplicate toasts with the same title and message from appearing simultaneously
        const isDuplicate = prev.some(
          (t) => t.title === toast.title && t.message === toast.message
        );
        if (isDuplicate) {
          return prev;
        }

        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newToast: ToastItem = {
          ...toast,
          id,
          timestamp: new Date(),
        };

        // Auto-dismiss after 6 seconds
        setTimeout(() => {
          dismissToast(id);
        }, 6000);

        playNotificationSound(toast.type);
        return [newToast, ...prev].slice(0, 4);
      });
    },
    [dismissToast]
  );

  const showToastRef = React.useRef(showToast);
  showToastRef.current = showToast;

  const refreshNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.notifications.getAll(1, isMentor ? "mentor" : "student");
      setUnreadNotifications(res.unreadCount || 0);
    } catch {
      // Ignore
    }
  }, [token, isMentor]);

  // Initial fetch of unread count on authentication
  useEffect(() => {
    if (!token) {
      setUnreadNotifications(0);
      setUnreadMessages(0);
      setToasts([]);
      recentlySeenRef.current.clear();
      return;
    }

    refreshNotifications();

    // Check unread conversations count
    api.messaging
      ?.getConversations?.()
      .then((data: any) => {
        if (Array.isArray(data?.conversations)) {
          const unreadCount = data.conversations.filter(
            (c: any) => c.unreadCount > 0
          ).length;
          setUnreadMessages(unreadCount);
        }
      })
      .catch(() => {});
  }, [token, refreshNotifications]);

  // Connect socket globally for live notifications & message alerts
  useEffect(() => {
    if (!token) return;

    let socket: any = null;
    try {
      socket = connectMessagingSocket();
    } catch (err) {
      console.warn("[NotificationContext] Could not connect socket:", err);
      return;
    }

    if (!socket) return;

    const handleNewNotification = (notification: any) => {
      const notifKey = notification?._id
        ? `notif:${notification._id}`
        : `notif:${notification?.type}:${notification?.message}:${notification?.course?._id || notification?.course || ""}`;

      if (isDuplicateEvent(notifKey)) {
        return;
      }

      setUnreadNotifications((prev) => prev + 1);

      let title = "New Notification";
      if (notification?.type === "new_enrollment") {
        title = "🎉 New Student Enrolled!";
      } else if (notification?.type === "course_review") {
        title = "⭐ New Course Review";
      }

      showToastRef.current({
        title,
        message: notification?.message || "You have a new update.",
        type: "notification",
        link: isMentorRef.current ? "/instructor/notifications" : "/notifications",
      });
    };

    const handleNewMessage = (msg: any) => {
      const msgKey = msg?._id
        ? `msg:${msg._id}`
        : `msg:${msg?.conversation}:${msg?.createdAt}:${msg?.content}`;

      if (isDuplicateEvent(msgKey)) {
        return;
      }

      // If user is currently looking at /messages, let Messages.tsx handle the conversation
      const isViewingChat = locationRef.current.startsWith("/messages");

      // Don't toast own sent messages
      const currentUserId = userRef.current?.id || (userRef.current as any)?._id;
      if (msg?.sender?._id && currentUserId && String(msg.sender._id) === String(currentUserId)) {
        return;
      }

      if (!isViewingChat) {
        setUnreadMessages((prev) => prev + 1);

        const senderName = msg?.sender?.name || "New Message";
        const contentSnippet =
          msg?.content && msg.content.length > 60
            ? `${msg.content.slice(0, 60)}...`
            : msg?.content || "Sent you a message";

        showToastRef.current({
          title: `💬 ${senderName}`,
          message: contentSnippet,
          type: "message",
          avatar: msg?.sender?.avatarUrl,
          link: "/messages",
        });
      }
    };

    socket.on("new_notification", handleNewNotification);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off("new_message", handleNewMessage);
    };
  }, [token, isDuplicateEvent]);

  return (
    <NotificationContext.Provider
      value={{
        unreadNotifications,
        unreadMessages,
        setUnreadNotifications,
        setUnreadMessages,
        refreshNotifications,
        showToast,
      }}
    >
      {children}

      {/* Floating Real-Time Toast Notifications */}
      <div className="eduverse-toast-container" role="region" aria-label="Notifications">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`eduverse-toast eduverse-toast-${toast.type}`}
            onClick={() => {
              if (toast.link) {
                navigate(toast.link);
              }
              dismissToast(toast.id);
            }}
          >
            {toast.avatar ? (
              <img
                src={toast.avatar}
                alt=""
                className="eduverse-toast-avatar"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="eduverse-toast-icon-wrap">
                {toast.type === "message" ? (
                  <MessageSquare size={18} />
                ) : (
                  <Bell size={18} />
                )}
              </div>
            )}

            <div className="eduverse-toast-body">
              <div className="eduverse-toast-title">
                <span>{toast.title}</span>
                <button
                  type="button"
                  className="eduverse-toast-close"
                  aria-label="Dismiss notification"
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissToast(toast.id);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
              <p className="eduverse-toast-text">{toast.message}</p>
              <span className="eduverse-toast-time">Just now</span>
            </div>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
