import type { Doc } from "./DocumentList";

export default function DocsDetail({
  selection,
}: {
  selection: {
    doc: Doc;
    chapter: { id: string; title: string; summary: string };
  } | null;
}) {
  return (
    <section
      id="docs-detail"
      className="border-t border-[color:var(--color-border)] bg-accent/20"
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-xl font-bold md:text-2xl">Chi tiết</h2>
        {!selection ? (
          <p className="mt-2 text-foreground/70">
            Chọn một chương để xem nội dung mô tả ở đây.
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-[color:var(--color-border)] bg-surface p-6">
            <p className="text-sm text-foreground/60">Thuộc tài liệu:</p>
            <h3 className="text-lg font-semibold">{selection.doc.title}</h3>
            <h4 className="mt-3 text-base font-semibold">
              {selection.chapter.title}
            </h4>
            <p className="mt-2 text-foreground/75">
              {selection.chapter.summary} — (nội dung chi tiết sẽ được render ở
              đây: trích đoạn, hình ảnh, trích dẫn nguồn, v.v.)
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
