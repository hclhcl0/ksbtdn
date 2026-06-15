"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ChatWidget.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const STORAGE_KEY = "cdc_chat_history";
const MAX_STORED_MESSAGES = 20;

const SUGGESTED_QUESTIONS = [
  "Giá tiêm vắc xin tại CDC Đà Nẵng?",
  "Lịch làm việc của CDC Đà Nẵng?",
  "Cách phòng ngừa sốt xuất huyết?",
  "Xét nghiệm HIV ở đâu tại Đà Nẵng?",
];

const BOT_GREETING = `Xin chào! Tôi là Trợ lý AI của Trung tâm Kiểm soát Bệnh tật TP. Đà Nẵng.\n\nTôi có thể giúp bạn tìm hiểu về các dịch vụ y tế, phòng bệnh, lịch tiêm chủng và nhiều thông tin sức khỏe khác.\n\nBạn muốn hỏi gì hôm nay?`;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState<boolean | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialized = useRef(false);

  // Load chat configuration and history on mount
  useEffect(() => {
    async function loadConfigAndHistory() {
      try {
        const res = await fetch("/api/chat/public");
        const data = await res.json();
        if (data.success) {
          setIsEnabled(data.enabled);
          setWelcomeMessage(data.welcomeMessage);
          
          if (!data.enabled) return;

          // Load history from sessionStorage
          const stored = sessionStorage.getItem(STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as Message[];
            if (Array.isArray(parsed) && parsed.length > 0) {
              setMessages(parsed);
              isInitialized.current = true;
              return;
            }
          }

          // First time greeting
          setMessages([
            {
              role: "assistant",
              content: data.welcomeMessage,
              timestamp: Date.now(),
            },
          ]);
          isInitialized.current = true;
        } else {
          setIsEnabled(false);
        }
      } catch (err) {
        console.error("Error loading AI Chat config:", err);
        setIsEnabled(false);
      }
    }
    loadConfigAndHistory();
  }, []);

  // Save to sessionStorage when messages change
  useEffect(() => {
    if (!isInitialized.current || !isEnabled) return;
    if (messages.length === 0) return;
    try {
      const toStore = messages.slice(-MAX_STORED_MESSAGES);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch {}
  }, [messages, isEnabled]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setHasNewMessage(false);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);

      // Build history for API (exclude greeting, last 10 messages)
      const history = messages
        .filter((m) => m.content !== welcomeMessage)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch("/api/chat/public", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed, history }),
        });

        const data = await res.json();

        const botMsg: Message = {
          role: "assistant",
          content: data.success
            ? data.answer
            : data.error || "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, botMsg]);

        if (!isOpen) setHasNewMessage(true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Xin lỗi, không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.",
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, isOpen, welcomeMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClearHistory = () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now(),
      },
    ]);
  };

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (isEnabled === null || !isEnabled) {
    return null;
  }

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.avatarWrap}>
                  <span className={styles.avatarIcon}>🤖</span>
                  <span className={styles.onlineDot} />
                </div>
                <div>
                  <div className={styles.headerTitle}>Trợ lý AI CDC Đà Nẵng</div>
                  <div className={styles.headerSub}>Hỗ trợ thông tin y tế</div>
                </div>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.iconBtn}
                  onClick={handleClearHistory}
                  title="Xóa lịch sử hội thoại"
                  aria-label="Xóa lịch sử"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
                <button
                  className={styles.iconBtn}
                  onClick={handleToggle}
                  title="Đóng"
                  aria-label="Đóng chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className={styles.messages} role="log" aria-live="polite">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`${styles.messageBubble} ${
                    msg.role === "user" ? styles.userBubble : styles.botBubble
                  }`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {msg.role === "assistant" && (
                    <div className={styles.botIcon}>🤖</div>
                  )}
                  <div className={styles.bubbleContent}>
                    <div className={styles.bubbleText}>
                      {msg.content.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                    <div className={styles.bubbleTime}>{formatTime(msg.timestamp)}</div>
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <motion.div
                  className={`${styles.messageBubble} ${styles.botBubble}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className={styles.botIcon}>🤖</div>
                  <div className={styles.bubbleContent}>
                    <div className={styles.typingIndicator}>
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (shown when only greeting exists) */}
            {messages.length === 1 && messages[0].role === "assistant" && (
              <div className={styles.suggestions}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className={styles.suggestionBtn}
                    onClick={() => sendMessage(q)}
                    disabled={isLoading}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className={styles.inputArea}>
              <textarea
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi... (Enter để gửi)"
                rows={1}
                maxLength={1000}
                disabled={isLoading}
                aria-label="Nhập câu hỏi cho trợ lý AI"
              />
              <button
                className={styles.sendBtn}
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                aria-label="Gửi câu hỏi"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        className={styles.fab}
        onClick={handleToggle}
        aria-label={isOpen ? "Đóng trợ lý AI" : "Mở trợ lý AI CDC Đà Nẵng"}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? {} : { y: [0, -4, 0] }}
        transition={
          isOpen
            ? {}
            : { y: { repeat: Infinity, repeatDelay: 3, duration: 0.6, ease: "easeInOut" } }
        }
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
              className={styles.fabIcon}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
              className={styles.fabIcon}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
        <span className={styles.fabLabel}>Hỏi đáp AI</span>

        {/* New message indicator */}
        {hasNewMessage && !isOpen && (
          <motion.span
            className={styles.notifDot}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          />
        )}
      </motion.button>
    </>
  );
}
