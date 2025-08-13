"use client";

export type ChatMessageItem = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Array<{
    document_id: number;
    chapter_id: number;
    chunk_id: number;
    page_number?: number | null;
    text: string;
    score?: number;
    url?: string | null;
  }>;
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
          <div key={m.id} className="space-y-2">
            <div
              className={
                (m.role === "assistant" ? "max-w-[80%] rounded-2xl bg-accent/40" : "ml-auto max-w-[80%] rounded-2xl border border-[color:var(--color-border)] bg-accent/60") +
                " px-3 py-2 text-sm whitespace-pre-wrap"
              }
            >
              {m.content}
            </div>
            {m.role === "assistant" && m.sources && m.sources.length > 0 ? (
              <div className="max-w-[80%] rounded-2xl border border-[color:var(--color-border)] bg-surface px-3 py-2 text-xs text-foreground shadow-sm">
                <div className="mb-1 font-medium">Nguồn trích dẫn</div>
                <div className="space-y-2">
                  {m.sources.map((s, idx) => (
                    <div key={s.chunk_id} className="rounded-xl bg-accent/20 p-2">
                      <div className="text-foreground/80">Doc #{s.document_id} • Chương #{s.chapter_id}{s.page_number ? ` • Trang ${s.page_number}` : ""}</div>
                      <div className="mt-1 whitespace-pre-wrap">{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  );
}
