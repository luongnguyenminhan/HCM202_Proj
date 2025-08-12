export default function FeatureTiles({
  onOpenChat,
}: {
  onOpenChat?: () => void;
}) {
  const tiles = [
    {
      t: "Vào Chatbot",
      d: "Hỏi - đáp nhanh, kèm trích dẫn.",
      target: "chat",
      kind: "chat" as const,
    },
    {
      t: "Tài liệu",
      d: "Danh sách chương, tóm tắt.",
      target: "docs",
      kind: "section" as const,
    },
    {
      t: "Phân tích chuyên đề",
      d: "Bài viết trả lời CQ.",
      target: "analysis",
      kind: "section" as const,
    },
  ];

  const go = (target: string) => {
    if (target === "chat") {
      onOpenChat?.();
      return;
    }
    const el = document.getElementById(target);
    if (!el) return;
    const HEADER_H = 72;
    const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H;
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", `#${target}`);
  };

  return (
    <section
      id="features"
      className="border-t border-[color:var(--color-border)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-2xl font-bold md:text-3xl">Bạn có thể làm gì?</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tiles.map(({ t, d, target, kind }) => (
            <button
              key={t}
              onClick={() => go(target)}
              className="card-tile group p-6 text-left transition hover:shadow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground text-surface">
                →
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t}</h3>
              <p className="mt-1 text-foreground/70">{d}</p>
              <span className="mt-4 inline-block text-sm font-medium text-brand group-hover:underline">
                {kind === "chat" ? "Mở dock chat" : `Đi tới ${t}`}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
