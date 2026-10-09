import React, { useState, useRef, useEffect } from "react";
import { api, getErrorMessage } from "../services/api";
import "./ChatAssistant.css";

interface ChatMessage {
  id: string;
  role: "system" | "user" | "ai";
  text: string;
}

interface ChatAssistantProps {
  lessonId: string;
  lessonTitle?: string;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ lessonId, lessonTitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened or when lesson changes
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "sys-1",
          role: "system",
          text: `Hi! I'm EduBot, your AI Teaching Assistant. Ask me anything about ${
            lessonTitle ? `"${lessonTitle}"` : "this lesson"
          }.`,
        },
      ]);
    }
  }, [isOpen, lessonId, lessonTitle, messages.length]);

  // Reset messages if the lesson changes
  useEffect(() => {
    setMessages([]);
  }, [lessonId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("eduverse_token");
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
      
      const res = await fetch(`${API_URL}/chat/lesson/${lessonId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to get response");
      }
      
      if (!res.body) {
        throw new Error("No readable stream");
      }

      const aiMsgId = (Date.now() + 1).toString();
      
      // Add empty AI message placeholder
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          role: "ai",
          text: "",
        },
      ]);
      
      // Stop the loading indicator since we're about to stream
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
              if (line.startsWith("data: ")) {
                const data = line.replace("data: ", "");
                if (data === "[DONE]") { done = true; break; }
                if (data === "[ERROR]") {
                  setMessages((prev) => [
                    ...prev,
                    { id: (Date.now() + 2).toString(), role: "system", text: "Error: Stream interrupted." },
                  ]);
                  done = true; break;
                }
                try {
                  const text = JSON.parse(data);
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMsgId ? { ...msg, text: msg.text + text } : msg
                    )
                  );
                } catch (e) {
                  // Ignore
                }
              }
            }
          }
        }
      }
    } catch (error) {
      const errMessage = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
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
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.role}`}>
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
              disabled={isLoading}
            />
            <button type="submit" disabled={!input.trim() || isLoading}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
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
