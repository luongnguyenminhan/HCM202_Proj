"use client";

import { PropsWithChildren, useEffect } from "react";
import ChatDock from "@/components/chatbot/ChatDock";

const HEADER_H = 72;
const EASE = "cubic-bezier(0.22,1,0.36,1)";

export default function SplitShell({
  open,
  onOpenChat,
  onCloseChat,
  children,
}: PropsWithChildren<{
  open: boolean;
  onOpenChat: () => void;
  onCloseChat: () => void;
}>) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const lockIfMobile = () => {
      if (open && window.innerWidth < 768) {
        const prev = document.body.style.overflow;
        document.body.dataset._prevOverflow = prev;
        document.body.style.overflow = "hidden";
      } else {
        if ("_prevOverflow" in document.body.dataset) {
          document.body.style.overflow =
            document.body.dataset._prevOverflow || "";
          delete document.body.dataset._prevOverflow;
        }
      }
    };

    lockIfMobile();
    const onResize = () => lockIfMobile();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if ("_prevOverflow" in document.body.dataset) {
        document.body.style.overflow =
          document.body.dataset._prevOverflow || "";
        delete document.body.dataset._prevOverflow;
      }
    };
  }, [open]);

  return (
    <div>
      <div className="md:flex md:gap-0">
        <div
          aria-hidden={!open}
          className="hidden md:block shrink-0"
          style={{
            width: open ? "40%" : "0px",
            transition: `width 520ms ${EASE}`,
          }}
        >
          <div
            className="sticky z-30 bg-surface"
            style={{
              top: HEADER_H,
              height: `calc(100vh - ${HEADER_H}px)`,
              borderRight: "1px solid var(--color-border)",
              overflow: "hidden",
            }}
          >
            {open && <ChatDock onClose={onCloseChat} />}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <main className={open ? "px-4 md:px-6 pb-10" : "px-2 md:px-6 pb-10"}>
            {children}
          </main>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onCloseChat}
            aria-hidden
          />
          <div className="absolute inset-0 bg-surface">
            <ChatDock onClose={onCloseChat} />
          </div>
        </div>
      )}
    </div>
  );
}
