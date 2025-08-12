"use client";

import { PropsWithChildren } from "react";
import ChatDock from "@/components/chatbot/ChatDock";

/**
 * SplitShell
 * - Desktop: left chat dock (40%) + right content (60%), animates width.
 * - Mobile: when `open` true, show full-screen chat overlay.
 * - Important: we only MOUNT ChatDock when `open` to avoid auto-scroll on reload.
 */
export default function SplitShell({
  open,
  onOpenChat, // not used here but kept for API symmetry; can remove if you prefer
  onCloseChat,
  children,
}: PropsWithChildren<{
  open: boolean;
  onOpenChat: () => void;
  onCloseChat: () => void;
}>) {
  const ease = "cubic-bezier(0.22,1,0.36,1)";
  const paneH = "calc(100vh - 120px)";

  return (
    <div
      data-open={open}
      className={open ? "md:h-[calc(100vh-120px)] md:overflow-hidden" : ""}
    >
      <div className="flex w-full gap-0">
        {/* LEFT: chat dock (desktop) */}
        <div
          className="hidden md:block overflow-hidden border-r border-[color:var(--color-border)]"
          style={{
            width: open ? "40%" : "0%",
            transition: `width 520ms ${ease}`,
          }}
          aria-hidden={!open}
        >
          {open && (
            <div
              className="translate-x-2 opacity-0"
              style={{
                height: paneH,
                transition: `opacity 420ms ${ease} 120ms, transform 420ms ${ease} 120ms`,
                opacity: 1,
                transform: "translateX(0)",
              }}
            >
              <ChatDock onClose={onCloseChat} />
            </div>
          )}
        </div>

        {/* RIGHT: content area (scrolls when chat is open) */}
        <div
          className={open ? "md:h-[calc(100vh-120px)] md:overflow-y-auto" : ""}
          style={{
            width: open ? "60%" : "100%",
            transition: `width 520ms ${ease}`,
          }}
        >
          <main className={open ? "px-4 md:px-6" : "px-2 md:px-6"}>
            {children}
          </main>
        </div>
      </div>

      {/* MOBILE: chat dock overlay (render only when open, mobile only) */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={onCloseChat} />
          <div className="absolute inset-0">
            <div className="h-full w-full bg-surface">
              <ChatDock onClose={onCloseChat} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
