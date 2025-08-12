"use client";

/**
 * Messages: simple, static intro bubbles.
 * Replace later with real chat history.
 */
export default function Messages() {
  return (
    <div className="space-y-3 px-4 py-4">
      <div className="max-w-[80%] rounded-2xl bg-accent/40 px-3 py-2 text-sm">
        Xin chào! Bạn muốn tra cứu nội dung nào?
      </div>
      <div
        role="note"
        className="ml-auto max-w-[80%] rounded-2xl border border-[color:var(--color-border)]
                   bg-accent/60 px-3 py-2 text-sm text-foreground/90 italic"
      >
        Ví dụ: “Đoàn kết quốc tế là gì?”
      </div>
    </div>
  );
}
