
import React, { useState, useRef, useEffect } from "react";
import "./ChatAssistant.css";

interface ChatMessage {
  id: string;
  role: "system" | "user" | "ai";
  text: string;
}

interface SavedChatMessage {
  _id?: string;
  id?: string;
  role: "user" | "ai";
  text: string;
  createdAt?: string;
}

interface ChatHistoryResponse {
  success: boolean;
  data: {
    messages?: SavedChatMessage[];
  } | null;
  message?: string;
}

interface ChatAssistantProps {
  lessonId: string;
  lessonTitle?: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({
  lessonId,
  lessonTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  // Greeting shown when the user has no saved conversation
  const getWelcomeMessage = (): ChatMessage => ({
    id: "sys-welcome",
    role: "system",
    text: `Hi! I'm EduBot, your AI Teaching Assistant. Ask me anything about ${
      lessonTitle ? `"${lessonTitle}"` : "this lesson"
    }.`,
  });

  // Load saved conversation whenever the chat opens or the lesson changes
  useEffect(() => {
    if (!isOpen || !lessonId) return;

    let cancelled = false;

    const loadChatHistory = async () => {
      setIsLoadingHistory(true);

      try {
        // Support both localStorage and sessionStorage authentication
        const token =
          localStorage.getItem("eduverse_token") ||
          sessionStorage.getItem("eduverse_token");

        if (!token) {
          if (!cancelled) {
            setMessages([getWelcomeMessage()]);
          }
          return;
        }

        const response = await fetch(
          `${API_URL}/chat/lesson/${lessonId}/history`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          throw new Error(
            errorData.message || "Failed to load chat history."
          );
        }

        const result: ChatHistoryResponse = await response.json();

        if (cancelled) return;

        const savedMessages = result.data?.messages || [];

        if (result.success && savedMessages.length > 0) {
          // Restore the saved messages in their original order
          const restoredMessages: ChatMessage[] = savedMessages.map(
            (msg, index) => ({
              id:
                msg._id ||
                msg.id ||
                `saved-${lessonId}-${index}`,
              role: msg.role,
              text: msg.text,
            })
          );

          setMessages(restoredMessages);
        } else {
          // Show the normal greeting when no conversation exists
          setMessages([getWelcomeMessage()]);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load chat history:", error);

          // Keep the chatbot usable even if history cannot be loaded
          setMessages((currentMessages) =>
            currentMessages.length > 0
              ? currentMessages
              : [getWelcomeMessage()]
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadChatHistory();

    return () => {
      cancelled = true;
    };
  }, [isOpen, lessonId, lessonTitle]);

  // Clear messages when switching to a different lesson
  useEffect(() => {
    setMessages([]);
  }, [lessonId]);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = input.trim();

    if (!trimmed || isLoading || isLoadingHistory) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token =
        localStorage.getItem("eduverse_token") ||
        sessionStorage.getItem("eduverse_token");

      if (!token) {
        throw new Error("Please log in again to use EduBot.");
      }

      const res = await fetch(
        `${API_URL}/chat/lesson/${lessonId}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: trimmed }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        throw new Error(
          errorData.message || "Failed to get response"
        );
      }

      if (!res.body) {
        throw new Error("No readable stream");
      }

      const aiMsgId = `ai-${Date.now()}`;

      // Add an empty AI message that will be filled as chunks arrive
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "ai",
          text: "",
        },
      ]);

      setIsLoading(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();

        done = doneReading;

        if (value) {
          buffer += decoder.decode(value, { stream: true });

          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            const lines = part.split("\n");

            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;

              const data = line.replace("data: ", "");

              if (data === "[DONE]") {
                done = true;
                break;
              }

              if (data === "[ERROR]") {
                setMessages((prev) => [
                  ...prev,
                  {
                    id: `error-${Date.now()}`,
                    role: "system",
                    text: "Error: Stream interrupted.",
                  },
                ]);

                done = true;
                break;
              }

              try {
                const chunkText: string = JSON.parse(data);

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === aiMsgId
                      ? { ...msg, text: msg.text + chunkText }
                      : msg
                  )
                );
              } catch {
                // Ignore invalid or incomplete stream chunks
              }
            }
          }
        }
      }

      // The backend saves the completed conversation to MongoDB.
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong.";

      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          text: `Error: ${errMessage}`,
        },
      ]);

      setIsLoading(false);
    }
  };

  return (
    <div className="chat-assistant-container">
      {isOpen && (
        <div className="chat-assistant-window">
          <div className="chat-header">
            <span>✨ Ask EduBot</span>

            <button
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
            {isLoadingHistory && messages.length === 0 && (
              <div className="chat-message system">
                Loading conversation...
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message ${msg.role}`}
              >
                {msg.text}
              </div>
            ))}

            {isLoading && (
              <div className="chat-message ai">
                <div className="chat-loading">
                  <div className="chat-dot"></div>
                  <div className="chat-dot"></div>
                  <div className="chat-dot"></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              disabled={isLoading || isLoadingHistory}
            />

            <button
              type="submit"
              disabled={
                !input.trim() || isLoading || isLoadingHistory
              }
            >
              <svg
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {!isOpen && (
        <button
          className="chat-assistant-toggle"
          onClick={() => setIsOpen(true)}
          title="Ask EduBot"
        >
          ✨ Ask EduBot
        </button>
      )}
    </div>
  );
};

export default ChatAssistant;
