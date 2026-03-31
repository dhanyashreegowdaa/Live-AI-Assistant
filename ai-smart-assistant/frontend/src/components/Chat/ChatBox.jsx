// Chat Box Component
import React, { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { sendMessage } from "../../services/api";
import FileUpload from "../Tools/FileUpload";
import VoiceInput from "../Tools/VoiceInput";

const STORAGE_KEY = "ai-smart-assistant-chat-sessions";

function makeSession() {
  return {
    id: `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: "New chat",
    messages: [],
    updatedAt: Date.now(),
  };
}

export default function ChatBox() {
  const [sessions, setSessions] = useState([makeSession()]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const messagesRef = useRef(null);
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) {
        setSessions(parsed);
        setActiveSessionId(parsed[0].id);
      }
    } catch {
      // no-op on invalid saved state
    }
  }, []);

  useEffect(() => {
    if (!activeSessionId && sessions.length) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    // Keep the latest messages in view.
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || !activeSession) return;

    setLoading(true);
    setInput("");

    const userMsg = { role: "user", content: trimmed };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSession.id
          ? {
              ...s,
              title: s.messages.length ? s.title : trimmed.slice(0, 40),
              messages: [...s.messages, userMsg],
              updatedAt: Date.now(),
            }
          : s
      )
    );

    try {
      const historyForApi = [...activeSession.messages, userMsg]
        .slice(-40)
        .map((m) => ({ role: m.role, content: m.content }));

      const promptWithFileContext = files.length
        ? `${trimmed}\n\nAttached files for context:\n${files
            .map((f) => `- ${f.name} (${f.type || "unknown"})`)
            .join("\n")}`
        : trimmed;

      const res = await sendMessage(promptWithFileContext, {
        sessionId: activeSession.id,
        history: historyForApi,
        metadata: { files: files.map((f) => ({ name: f.name, type: f.type, size: f.size })) },
      });
      const botMsg = { role: "assistant", content: res || "No response received." };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [...s.messages, botMsg], updatedAt: Date.now() }
            : s
        )
      );
      setFiles([]);
    } catch (err) {
      const botMsg = {
        role: "assistant",
        content: err?.message ? String(err.message) : "Something went wrong.",
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, messages: [...s.messages, botMsg], updatedAt: Date.now() }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-shell">
      <aside className="sidebar">
        <div className="history-container">
          <button
            className="new-chat-btn"
            onClick={() => {
              const s = makeSession();
              setSessions((prev) => [s, ...prev]);
              setActiveSessionId(s.id);
              setFiles([]);
              setInput("");
            }}
          >
            + New chat
          </button>
          <h3 className="history-title">Chats</h3>
          <div className="history-list">
            {sessions
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map((s) => (
                <button
                  key={s.id}
                  className={`history-item ${s.id === activeSession?.id ? "history-item-active" : ""}`}
                  onClick={() => setActiveSessionId(s.id)}
                >
                  {s.title || "New chat"}
                </button>
              ))}
          </div>
        </div>
      </aside>

      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-brand">AI Smart Assistant</div>
          <div className="chat-badge">{loading ? "Thinking..." : "Ready"}</div>
        </div>

        <div className="chat-inner">
          <div className="messages" ref={messagesRef} aria-live="polite">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading ? (
              <div className="typing-indicator">
                Assistant is typing<span className="typing-dots">...</span>
              </div>
            ) : null}
          </div>

          {files.length ? (
            <div className="attachments">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="attachment-chip">
                  <span>{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <div className="composer">
            <div className="tool-row">
              <FileUpload
                disabled={loading}
                onFilesSelected={(incoming) =>
                  setFiles((prev) => [...prev, ...incoming.filter((f) => /pdf|video/i.test(f.type) || /\.pdf$/i.test(f.name))])
                }
              />
              <VoiceInput disabled={loading} onTranscript={(text) => setInput((prev) => `${prev} ${text}`.trim())} />
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Send a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}