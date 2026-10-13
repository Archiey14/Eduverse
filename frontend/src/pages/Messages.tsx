
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { connectMessagingSocket } from "../services/socket";
import { api, getErrorMessage } from "../services/api";
import "./Messages.css";

type Participant = {
  _id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
};

type ChatMessage = {
  _id: string;
  conversation: string | { _id: string };
  content: string;
  sender: Participant | string;
  createdAt: string;
};

type Conversation = {
  _id: string;
  type: "course" | "direct";
  displayName?: string;
  course?: {
    _id: string;
    title: string;
    thumbnailUrl?: string;
    mentor?: string;
  };
  participants?: Participant[];
  lastMessage?: ChatMessage | string | null;
  lastMessageAt?: string | null;
  updatedAt: string;
};

type SearchUser = Participant & {
  roles?: string[];
};

type SocketResult = {
  ok: boolean;
  error?: string;
  message?: ChatMessage;
};

type StoredUser = {
  _id?: string;
  id?: string;
};

const getPayload = (response: unknown): unknown => {
  if (!response || typeof response !== "object") {
    return response;
  }

  const object = response as Record<string, unknown>;

  if (object.data && typeof object.data === "object") {
    return object.data;
  }

  return response;
};

const extractArray = <T,>(
  response: unknown,
  key: "conversations" | "messages" | "users"
): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== "object") {
    return [];
  }

  const object = response as Record<string, unknown>;
  const payload = getPayload(response);

  if (Array.isArray(object[key])) {
    return object[key] as T[];
  }

  if (payload && typeof payload === "object") {
    const nested = payload as Record<string, unknown>;

    if (Array.isArray(nested[key])) {
      return nested[key] as T[];
    }

    if (Array.isArray(nested.data)) {
      return nested.data as T[];
    }
  }

  return [];
};

const getConversationFromResponse = (
  response: unknown
): Conversation | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const object = response as Record<string, unknown>;
  const payload = getPayload(response);

  let candidate =
    object.conversation ??
    (payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).conversation
      : undefined);

  if (!candidate && payload && typeof payload === "object") {
    const nested = payload as Record<string, unknown>;

    if (typeof nested._id === "string") {
      candidate = nested;
    }
  }

  if (
    !candidate ||
    typeof candidate !== "object" ||
    typeof (candidate as Record<string, unknown>)._id !== "string"
  ) {
    return null;
  }

  return candidate as Conversation;
};

const getConversationId = (message: any): string => {
  if (!message) return "";
  if (typeof message.conversation === "string") return message.conversation;
  if (message.conversation?._id) return String(message.conversation._id);
  if (message.conversationId) return String(message.conversationId);
  return "";
};

const getMessageSenderName = (message: ChatMessage): string =>
  typeof message.sender === "string"
    ? "User"
    : message.sender?.name || "User";

const getMessageSenderId = (message: ChatMessage): string =>
  typeof message.sender === "string"
    ? message.sender
    : message.sender?._id || "";

const getStoredCurrentUser = (): StoredUser | null => {
  try {
    const raw =
      sessionStorage.getItem("eduverse_user") ||
      localStorage.getItem("eduverse_user");

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const object = parsed as Record<string, unknown>;
    const user =
      object.user && typeof object.user === "object"
        ? (object.user as Record<string, unknown>)
        : object;

    return {
      _id: typeof user._id === "string" ? user._id : undefined,
      id: typeof user.id === "string" ? user.id : undefined,
    };
  } catch {
    return null;
  }
};

const getCurrentUserId = (): string => {
  const user = getStoredCurrentUser();
  return user?._id || user?.id || "";
};

const getInitials = (name?: string): string => {
  if (!name?.trim()) return "?";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getUserRole = (roles?: string[]): string => {
  if (!roles?.length) return "Eduverse member";

  const role = roles.find((item) =>
    ["mentor", "instructor", "admin", "student"].includes(
      item.toLowerCase()
    )
  );

  if (!role) return "Eduverse member";

  const normalized = role.toLowerCase();

  if (normalized === "instructor") return "Instructor";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatConversationDate = (
  date?: string | null
): string => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatMessageTime = (date?: string): string => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const sortConversations = (
  items: Conversation[]
): Conversation[] => {
  return [...items].sort((a, b) => {
    const aDate = new Date(
      a.lastMessageAt || a.updatedAt || 0
    ).getTime();

    const bDate = new Date(
      b.lastMessageAt || b.updatedAt || 0
    ).getTime();

    return (
      (Number.isNaN(bDate) ? 0 : bDate) -
      (Number.isNaN(aDate) ? 0 : aDate)
    );
  });
};

/**
 * Merge messages by ID so that:
 * - duplicate Socket.IO events are ignored;
 * - a history response cannot erase messages received live;
 * - messages stay in chronological order.
 */
const mergeMessages = (
  existing: ChatMessage[],
  incoming: ChatMessage[]
): ChatMessage[] => {
  const merged = new Map<string, ChatMessage>();

  for (const message of existing) {
    merged.set(message._id, message);
  }

  for (const message of incoming) {
    const previous = merged.get(message._id);

    merged.set(message._id, {
      ...previous,
      ...message,
    });
  }

  return Array.from(merged.values()).sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();

    return (
      (Number.isNaN(aTime) ? 0 : aTime) -
      (Number.isNaN(bTime) ? 0 : bTime)
    );
  });
};

function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const [showNewMessage, setShowNewMessage] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);

  const socketRef =
    useRef<ReturnType<typeof connectMessagingSocket> | null>(null);
  const activeConversationRef = useRef<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const searchRequestRef = useRef(0);
  const conversationRequestRef = useRef(0);
  const messageRequestRef = useRef(0);
  const mountedRef = useRef(false);

  const { user: authUser } = useAuth();
  const currentUserId = authUser?.id || (authUser as any)?._id || getCurrentUserId();

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  const loadConversations = useCallback(async () => {
    const requestId = ++conversationRequestRef.current;

    setLoadingConversations(true);
    setError("");

    try {
      const response: unknown =
        await api.messaging.getConversations();

      if (
        requestId !== conversationRequestRef.current ||
        !mountedRef.current
      ) {
        return;
      }

      const items = sortConversations(
        extractArray<Conversation>(response, "conversations")
      );

      setConversations((existing) => {
        // Preserve a live message preview if it arrived while this
        // conversation-list request was running.
        const previousById = new Map(
          existing.map((item) => [item._id, item])
        );

        return sortConversations(
          items.map((item) => {
            const previous = previousById.get(item._id);

            if (
              previous?.lastMessageAt &&
              item.lastMessageAt &&
              new Date(previous.lastMessageAt).getTime() >
                new Date(item.lastMessageAt).getTime()
            ) {
              return {
                ...item,
                lastMessage: previous.lastMessage,
                lastMessageAt: previous.lastMessageAt,
                updatedAt: previous.updatedAt,
              };
            }

            return item;
          })
        );
      });

      setActiveConversation((current) => {
        if (current) {
          return (
            items.find((item) => item._id === current._id) ||
            current
          );
        }

        return items[0] || null;
      });
    } catch (err) {
      if (
        requestId === conversationRequestRef.current &&
        mountedRef.current
      ) {
        setError(
          getErrorMessage(err, "Unable to load conversations.")
        );
      }
    } finally {
      if (
        requestId === conversationRequestRef.current &&
        mountedRef.current
      ) {
        setLoadingConversations(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadConversations();

    return () => {
      mountedRef.current = false;
      conversationRequestRef.current += 1;
      messageRequestRef.current += 1;
      searchRequestRef.current += 1;
    };
  }, [loadConversations]);

  // Connect to Socket.IO and register one set of page listeners.
  useEffect(() => {
    let socket: ReturnType<typeof connectMessagingSocket>;

    try {
      socket = connectMessagingSocket();
      socketRef.current = socket;
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to connect to messaging.")
      );
      setConnectionStatus("disconnected");
      return;
    }

    let disposed = false;

    const joinActiveConversation = () => {
      const conversation = activeConversationRef.current;

      if (!conversation || !socket.connected) return;

      socket.emit(
        "join_conversation",
        { conversationId: conversation._id },
        (result: SocketResult) => {
          if (disposed || result?.ok) return;

          setError(
            result?.error || "Unable to join this conversation."
          );
        }
      );
    };

    const handleConnect = () => {
      if (disposed) return;

      setConnectionStatus("connected");
      joinActiveConversation();
    };

    const handleDisconnect = () => {
      if (!disposed) {
        setConnectionStatus("disconnected");
      }
    };

    const handleConnectError = (err: Error) => {
      if (disposed) return;

      setConnectionStatus("disconnected");
      setError(err.message || "Messaging connection failed.");
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (disposed || !message?._id) return;

      const conversationId = getConversationId(message);

      if (!conversationId) return;

      const currentActiveId = activeConversationRef.current?._id
        ? String(activeConversationRef.current._id)
        : "";

      if (currentActiveId && currentActiveId === String(conversationId)) {
        setMessages((existing) =>
          mergeMessages(existing, [message])
        );
      }

      setConversations((existing) => {
        const found = existing.some(
          (conversation) =>
            String(conversation._id) === String(conversationId)
        );

        if (!found) {
          void loadConversations();
          return existing;
        }

        return sortConversations(
          existing.map((conversation) =>
            String(conversation._id) === String(conversationId)
              ? {
                  ...conversation,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                  updatedAt: message.createdAt,
                }
              : conversation
          )
        );
      });
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("new_message", handleNewMessage);

    if (socket.connected) {
      handleConnect();
    } else {
      setConnectionStatus("connecting");
    }

    return () => {
      disposed = true;

      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("new_message", handleNewMessage);

      // This is a shared socket; leave it connected for other pages.
      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [loadConversations]);

  // Search people with a debounce to avoid excessive API requests.
  useEffect(() => {
    const query = userSearch.trim();
    const requestId = ++searchRequestRef.current;

    setSearchError("");
    setSearchResults([]);

    if (!showNewMessage || query.length < 2) {
      setSearchingUsers(false);
      return;
    }

    setSearchingUsers(true);

    const timer = window.setTimeout(async () => {
      try {
        const response: unknown =
          await api.messaging.searchUsers(query);

        if (
          requestId !== searchRequestRef.current ||
          !mountedRef.current
        ) {
          return;
        }

        setSearchResults(
          extractArray<SearchUser>(response, "users")
        );
      } catch (err) {
        if (
          requestId === searchRequestRef.current &&
          mountedRef.current
        ) {
          setSearchError(
            getErrorMessage(err, "Unable to search for users.")
          );
        }
      } finally {
        if (
          requestId === searchRequestRef.current &&
          mountedRef.current
        ) {
          setSearchingUsers(false);
        }
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [userSearch, showNewMessage]);

  // Load selected conversation history without overwriting messages
  // that arrive through Socket.IO while the request is in flight.
  useEffect(() => {
    const requestId = ++messageRequestRef.current;
    const conversationId = activeConversation?._id;

    if (!conversationId) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    let cancelled = false;

    setMessages([]);
    setLoadingMessages(true);
    setError("");

    const loadMessages = async () => {
      try {
        const response: unknown =
          await api.messaging.getMessages(conversationId, {
            limit: 50,
          });

        if (
          cancelled ||
          requestId !== messageRequestRef.current
        ) {
          return;
        }

        const history = extractArray<ChatMessage>(
          response,
          "messages"
        );

        setMessages((existing) => {
          // Only merge messages belonging to the selected conversation.
          const liveMessages = existing.filter(
            (message) =>
              getConversationId(message) === conversationId
          );

          return mergeMessages(history, liveMessages);
        });
      } catch (err) {
        if (
          !cancelled &&
          requestId === messageRequestRef.current
        ) {
          setError(
            getErrorMessage(err, "Unable to load message history.")
          );
        }
      } finally {
        if (
          !cancelled &&
          requestId === messageRequestRef.current
        ) {
          setLoadingMessages(false);
        }
      }
    };

    void loadMessages();

    const socket = socketRef.current;

    const joinConversation = () => {
      if (cancelled || !socket?.connected) return;

      socket.emit(
        "join_conversation",
        { conversationId },
        (result: SocketResult) => {
          if (cancelled || result?.ok) return;

          setError(
            result?.error || "Unable to join this conversation."
          );
        }
      );
    };

    if (socket?.connected) {
      joinConversation();
    }

    return () => {
      cancelled = true;

      if (socket?.connected) {
        socket.emit("leave_conversation", { conversationId });
      }
    };
  }, [activeConversation?._id, connectionStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = draft.trim();
    const conversation = activeConversation;
    const socket = socketRef.current;

    if (!content || !conversation || sending) return;

    if (!socket?.connected) {
      setError(
        "You're disconnected. Please wait for reconnection."
      );
      return;
    }

    setSending(true);
    setError("");

    socket.emit(
      "send_message",
      {
        conversationId: conversation._id,
        content,
      },
      (result: SocketResult) => {
        setSending(false);

        if (!result?.ok) {
          setError(
            result?.error || "Unable to send your message."
          );
          return;
        }

        setDraft("");

        if (result.message) {
          const sentMessage = result.message;

          setMessages((existing) => {
            // Do not append the same message twice: the socket event
            // and the acknowledgement may both deliver it.
            if (
              getConversationId(sentMessage) !==
              activeConversationRef.current?._id
            ) {
              return existing;
            }

            return mergeMessages(existing, [sentMessage]);
          });

          setConversations((existing) =>
            sortConversations(
              existing.map((item) =>
                item._id === conversation._id
                  ? {
                      ...item,
                      lastMessage: sentMessage,
                      lastMessageAt: sentMessage.createdAt,
                      updatedAt: sentMessage.createdAt,
                    }
                  : item
              )
            )
          );
        }
      }
    );
  };

  const handleOpenDirectMessage = async (user: SearchUser) => {
    if (openingUserId) return;

    setOpeningUserId(user._id);
    setSearchError("");

    try {
      const response: unknown =
        await api.messaging.openDirectConversation(user._id);

      const conversation = getConversationFromResponse(response);

      if (!conversation?._id) {
        throw new Error(
          "The server did not return a conversation."
        );
      }

      const completeConversation: Conversation = {
        ...conversation,
        type: "direct",
        participants: conversation.participants?.length
          ? conversation.participants
          : [
              {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl,
              },
            ],
      };

      setConversations((existing) =>
        sortConversations([
          completeConversation,
          ...existing.filter(
            (item) => item._id !== completeConversation._id
          ),
        ])
      );

      setActiveConversation(completeConversation);
      setShowNewMessage(false);
      setUserSearch("");
      setSearchResults([]);
      setSearchError("");
      setError("");
    } catch (err) {
      setSearchError(
        getErrorMessage(
          err,
          "Unable to open this conversation."
        )
      );
    } finally {
      setOpeningUserId(null);
    }
  };

  const getConversationName = (
    conversation: Conversation
  ): string => {
    if (conversation.type === "course") {
      return (
        conversation.displayName ||
        conversation.course?.title ||
        "Course group"
      );
    }

    const otherParticipant = conversation.participants?.find(
      (participant) =>
        currentUserId && participant._id !== currentUserId
    );

    return (
      otherParticipant?.name ||
      conversation.displayName ||
      conversation.participants?.[0]?.name ||
      "Direct conversation"
    );
  };

  const renderAvatar = (
    user: Pick<Participant, "name" | "avatarUrl">,
    className: string
  ) => (
    <span className={className}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" />
      ) : (
        getInitials(user.name)
      )}
    </span>
  );

  const getLastMessageContent = (
    lastMessage?: ChatMessage | string | null
  ): string => {
    if (!lastMessage) return "";

    if (typeof lastMessage === "string") {
      return "Open conversation to view messages";
    }

    return lastMessage.content || "";
  };

  const getLastMessageSenderId = (
    lastMessage?: ChatMessage | string | null
  ): string => {
    if (!lastMessage || typeof lastMessage === "string") {
      return "";
    }

    return getMessageSenderId(lastMessage);
  };

  return (
    <main className="messages-page">
      <section className="messages-shell">
        <aside className="messages-sidebar">
          <div className="messages-sidebar-header">
            <div>
              <p className="messages-eyebrow">EDUVERSE</p>
              <h1>Messages</h1>
            </div>

            <span
              className={`messages-status messages-status-${connectionStatus}`}
              title={`Socket ${connectionStatus}`}
              aria-label={`Connection ${connectionStatus}`}
            />
          </div>

          <p className="messages-sidebar-subtitle">
            Your course groups and conversations
          </p>

          <div className="messages-sidebar-actions">
            <button
              type="button"
              className={`messages-new-button ${
                showNewMessage ? "messages-new-button-active" : ""
              }`}
              onClick={() => {
                setShowNewMessage((current) => !current);
                setUserSearch("");
                setSearchResults([]);
                setSearchError("");
              }}
              aria-expanded={showNewMessage}
              aria-controls="messages-new-message-panel"
            >
              <span
                className="messages-new-button-icon"
                aria-hidden="true"
              >
                {showNewMessage ? "×" : "+"}
              </span>

              <span>
                {showNewMessage ? "Close panel" : "New message"}
              </span>
            </button>
          </div>

          {showNewMessage && (
            <section
              id="messages-new-message-panel"
              className="messages-user-search"
            >
              <div className="messages-search-heading">
                <div
                  className="messages-search-heading-icon"
                  aria-hidden="true"
                >
                  ✉
                </div>

                <div>
                  <h2>Start a conversation</h2>
                  <p>Connect with someone on Eduverse</p>
                </div>
              </div>

              <label
                className="messages-search-label"
                htmlFor="messages-user-search-input"
              >
                Search people
              </label>

              <div className="messages-search-input-wrap">
                <span
                  aria-hidden="true"
                  className="messages-search-icon"
                >
                  ⌕
                </span>

                <input
                  id="messages-user-search-input"
                  type="search"
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(event.target.value)
                  }
                  placeholder="Name or email address"
                  autoComplete="off"
                  aria-describedby="messages-search-help"
                />

                {userSearch && (
                  <button
                    type="button"
                    className="messages-search-clear"
                    onClick={() => setUserSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <p
                id="messages-search-help"
                className="messages-search-hint"
              >
                Search by name or email to find a student or mentor.
              </p>

              <div
                className="messages-search-content"
                aria-live="polite"
              >
                {userSearch.trim().length < 2 ? (
                  <div className="messages-search-prompt">
                    <span
                      className="messages-search-prompt-icon"
                      aria-hidden="true"
                    >
                      ↗
                    </span>

                    <span>
                      Enter at least 2 characters to search.
                    </span>
                  </div>
                ) : searchingUsers ? (
                  <div className="messages-search-loading">
                    <span className="messages-search-spinner" />
                    <span>Finding people…</span>
                  </div>
                ) : searchError ? (
                  <div
                    className="messages-search-feedback messages-search-feedback-error"
                    role="alert"
                  >
                    <span aria-hidden="true">!</span>
                    <p>{searchError}</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="messages-search-feedback">
                    <span
                      className="messages-search-empty-icon"
                      aria-hidden="true"
                    >
                      ⌕
                    </span>

                    <strong>No people found</strong>
                    <p>Try another name or email address.</p>
                  </div>
                ) : (
                  <>
                    <div className="messages-search-results-heading">
                      <span>PEOPLE</span>
                      <span>{searchResults.length} found</span>
                    </div>

                    <div className="messages-search-results">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          type="button"
                          className="messages-search-user"
                          onClick={() =>
                            void handleOpenDirectMessage(user)
                          }
                          disabled={openingUserId !== null}
                        >
                          {renderAvatar(
                            user,
                            "messages-user-avatar"
                          )}

                          <span className="messages-user-details">
                            <strong>{user.name}</strong>
                            <small>{getUserRole(user.roles)}</small>
                            {user.email && (
                              <small>{user.email}</small>
                            )}
                          </span>

                          <span className="messages-user-action">
                            {openingUserId === user._id ? (
                              <span className="messages-button-spinner" />
                            ) : (
                              <>
                                <span>Chat</span>
                                <span aria-hidden="true">→</span>
                              </>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          )}

          {loadingConversations ? (
            <div className="messages-empty">
              <span className="messages-search-spinner" />
              <p>Loading conversations…</p>
            </div>
          ) : error && conversations.length === 0 ? (
            <div className="messages-empty" role="alert">
              <strong>Unable to load conversations</strong>
              <p>{error}</p>
              <button
                type="button"
                onClick={() => void loadConversations()}
              >
                Try again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="messages-empty">
              <div className="messages-empty-icon">✉</div>
              <strong>No conversations yet</strong>
              <p>
                Start a private chat or enroll in a course to join
                its group.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowNewMessage(true);
                  setSearchError("");
                }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            <div className="conversation-list">
              {conversations.map((conversation) => {
                const selected =
                  activeConversation?._id === conversation._id;

                const lastSender = getLastMessageSenderId(
                  conversation.lastMessage
                );

                const isOwnLastMessage =
                  Boolean(currentUserId) &&
                  lastSender === currentUserId;

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    className={`conversation-item ${
                      selected ? "conversation-item-active" : ""
                    }`}
                    onClick={() => {
                      if (
                        conversation._id !==
                        activeConversation?._id
                      ) {
                        setActiveConversation(conversation);
                      }
                    }}
                    aria-pressed={selected}
                  >
                    <span className="conversation-avatar">
                      {conversation.type === "course"
                        ? "▦"
                        : getInitials(
                            getConversationName(conversation)
                          )}
                    </span>

                    <span className="conversation-item-content">
                      <span className="conversation-item-top">
                        <strong>
                          {getConversationName(conversation)}
                        </strong>

                        <span>
                          {formatConversationDate(
                            conversation.lastMessageAt
                          )}
                        </span>
                      </span>

                      <span className="conversation-item-category">
                        {conversation.type === "course"
                          ? "Course group"
                          : "Direct message"}
                      </span>

                      <span className="conversation-item-preview">
                        {conversation.lastMessage ? (
                          <>
                            {isOwnLastMessage ? "You: " : ""}
                            {getLastMessageContent(
                              conversation.lastMessage
                            )}
                          </>
                        ) : (
                          "Start a conversation"
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="messages-chat">
          {activeConversation ? (
            <>
              <header className="messages-chat-header">
                <span className="conversation-avatar conversation-avatar-large">
                  {activeConversation.type === "course"
                    ? "▦"
                    : getInitials(
                        getConversationName(activeConversation)
                      )}
                </span>

                <div className="messages-chat-header-info">
                  <h2>
                    {getConversationName(activeConversation)}
                  </h2>

                  <p>
                    <span
                      className={`messages-header-dot ${
                        connectionStatus === "connected"
                          ? "messages-header-dot-online"
                          : ""
                      }`}
                    />

                    {activeConversation.type === "course"
                      ? "Course group conversation"
                      : "Private conversation"}
                  </p>
                </div>
              </header>

              {error && (
                <div className="messages-error" role="alert">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => setError("")}
                    aria-label="Dismiss error"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="messages-history" aria-live="polite">
                {loadingMessages ? (
                  <div className="messages-empty">
                    <span className="messages-search-spinner" />
                    <p>Loading messages…</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="messages-welcome">
                    <div className="messages-welcome-icon">✦</div>
                    <h3>Start the conversation</h3>
                    <p>
                      Send your first message and keep the
                      conversation going.
                    </p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderId = getMessageSenderId(message);
                    const isOwnMessage =
                      Boolean(currentUserId) &&
                      senderId === currentUserId;

                    const sender =
                      typeof message.sender === "string"
                        ? null
                        : message.sender;

                    return (
                      <article
                        key={message._id}
                        className={`message-row ${
                          isOwnMessage ? "message-row-own" : ""
                        }`}
                      >
                        {sender ? (
                          renderAvatar(sender, "message-avatar")
                        ) : (
                          <span className="message-avatar">
                            {getInitials(
                              getMessageSenderName(message)
                            )}
                          </span>
                        )}

                        <div className="message-body">
                          <div className="message-meta">
                            <strong>
                              {isOwnMessage
                                ? "You"
                                : getMessageSenderName(message)}
                            </strong>

                            <time dateTime={message.createdAt}>
                              {formatMessageTime(message.createdAt)}
                            </time>
                          </div>

                          <p>{message.content}</p>
                        </div>
                      </article>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                className="messages-composer"
                onSubmit={handleSend}
              >
                <input
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value)
                  }
                  placeholder="Write a message…"
                  maxLength={5000}
                  aria-label="Message"
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                >
                  <span>
                    {sending ? "Sending…" : "Send message"}
                  </span>
                  <span aria-hidden="true">↗</span>
                </button>
              </form>
            </>
          ) : (
            <div className="messages-welcome">
              <div className="messages-welcome-icon">✉</div>
              <h2>Your conversations, in one place</h2>
              <p>
                Select a conversation or start a new private chat
                with someone from Eduverse.
              </p>

              <button
                type="button"
                className="messages-welcome-button"
                onClick={() => {
                  setShowNewMessage(true);
                  setSearchError("");
                }}
              >
                <span aria-hidden="true">＋</span>
                New message
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Messages;
