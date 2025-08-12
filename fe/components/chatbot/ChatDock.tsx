"use client";

import { useEffect, useRef, useState } from "react";
import HeaderBar from "./HeaderBar";
import Messages from "./Messages";
import InputBar from "./InputBar";
import ReportModal from "./ReportModal";

/**
 * ChatDock: left panel container that hosts the chatbot UI.
 * - Owns the "report" modal open state.
 * - Focuses the input on mount for faster typing.
 */
export default function ChatDock({ onClose }: { onClose: () => void }) {
  const [reportOpen, setReportOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Autofocus the message input when the dock mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Top bar with actions */}
      <HeaderBar onClose={onClose} onOpenReport={() => setReportOpen(true)} />

      {/* Scrollable chat area */}
      <div className="flex-1 overflow-y-auto">
        <Messages />
      </div>

      {/* Input row */}
      <InputBar
        inputRef={inputRef}
        onSend={(val) => console.log("send:", val)}
      />

      {/* Report modal (feedback for incorrect data) */}
      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
