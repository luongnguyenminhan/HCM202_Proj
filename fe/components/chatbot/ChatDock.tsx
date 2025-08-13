"use client";

import { useEffect, useRef, useState } from "react";
import HeaderBar from "./HeaderBar";
import Messages, { ChatMessageItem } from "./Messages";
import InputBar from "./InputBar";
import ReportModal from "./ReportModal";
import { streamChat } from "@/services/chat";

/**
 * ChatDock: left panel container that hosts the chatbot UI.
 * - Owns the "report" modal open state.
 * - Focuses the input on mount for faster typing.
 */
export default function ChatDock({ onClose }: { onClose: () => void }) {
  const [reportOpen, setReportOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const streamRef = useRef<{ close: () => void } | null>(null);

  // Autofocus the message input when the dock mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.close?.();
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Top bar with actions */}
      <HeaderBar onClose={onClose} onOpenReport={() => setReportOpen(true)} />

      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto">
        <Messages messages={messages} />
      </div>

      {/* Input row */}
      <InputBar
        inputRef={inputRef}
        onSend={(val) => {
          const userMsg: ChatMessageItem = { id: crypto.randomUUID(), role: "user", content: val };
          const aiMsgId = crypto.randomUUID();
          setMessages((prev) => [...prev, userMsg, { id: aiMsgId, role: "assistant", content: "" }]);

          // close previous stream if any
          streamRef.current?.close?.();

          // start SSE stream
          const controller = streamChat(val, { includeDebug: false }, (evt) => {
            if (evt.type === "token") {
              const token = String(evt.data?.token ?? "");
              setMessages((prev) => prev.map((m) => (m.id === aiMsgId ? { ...m, content: m.content + token } : m)));
            } else if (evt.type === "done") {
              // no-op for now
            }
          });
          streamRef.current = controller;
        }}
      />

      {/* Report modal (feedback for incorrect data) */}
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
