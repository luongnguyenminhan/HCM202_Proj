"use client";

export type ChatMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

/**
 * Messages: render danh sách hội thoại đơn giản.
 */
export default function Messages({ messages }: { messages: ChatMessageItem[] }) {
  return (
    <div className="space-y-3 px-4 py-4">
      {messages.length === 0 ? (
        <>
          <div className="max-w-[80%] rounded-2xl bg-accent/40 px-3 py-2 text-sm">
            Xin chào! Bạn muốn tra cứu nội dung nào?
          </div>
          <div
            role="note"
            className="ml-auto max-w-[80%] rounded-2xl border border-[color:var(--color-border)] bg-accent/60 px-3 py-2 text-sm text-foreground/90 italic"
          >
            Ví dụ: “Đoàn kết quốc tế là gì?”
          </div>
        </>
      ) : (
        messages.map((m) => (
          <div
            key={m.id}
            className={
              (m.role === "assistant" ? "max-w-[80%] rounded-2xl bg-accent/40" : "ml-auto max-w-[80%] rounded-2xl border border-[color:var(--color-border)] bg-accent/60") +
              " px-3 py-2 text-sm whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))
      )}
    </div>
  );
}
