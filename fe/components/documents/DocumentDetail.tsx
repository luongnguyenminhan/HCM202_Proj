"use client";

import type { Doc } from "./DocumentList";

export type ChapterLite = {
  id: string;
  title: string;
  summary: string;
  content?: string; // optional long content
};

type Props = {
  selection: { doc: Doc; chapter: ChapterLite } | null;
};

export default function DocsDetail({ selection }: Props) {
  // Render paragraphs from `content` or fallback to `summary`
  const renderBody = (content?: string, fallback?: string) => {
    const text = (content && content.trim()) || fallback?.trim();
    if (!text) {
      return (
        <p className="mt-2 text-foreground/70">
          Nội dung chi tiết sẽ được cập nhật (trích đoạn, hình ảnh, trích dẫn nguồn, v.v.).
        </p>
      );
    }

    return text
      .split(/\n{2,}/) // split by blank lines -> paragraphs
      .map((p, i) => (
        <p key={i} className="mt-3 leading-7 text-foreground/75">
          {p}
        </p>
      ));
  };

  return (
    <section id="docs-detail" className="bg-accent/20 scroll-mt-[72px]">
      <div className=".mx-auto max-w-7xl px-4 py-10" style={{margin: "0 auto"}}>
        <h2 className="text-xl font-bold md:text-2xl">Chi tiết</h2>

        {!selection ? (
          <p className="mt-2 text-foreground/70">
            Chọn một chương để xem nội dung mô tả ở đây.
          </p>
        ) : (
          <article
            className="mt-4 w-full rounded-2xl border border-[color:var(--color-border)] bg-surface p-6"

            style={{
              transition:
                "opacity 260ms cubic-bezier(0.22,1,0.36,1), transform 260ms cubic-bezier(0.22,1,0.36,1)",
              opacity: 1,
              transform: "translateY(0)",
            }}
            aria-live="polite"
          >
            <p className="text-sm text-foreground/60">Thuộc tài liệu:</p>
            <h3 className="text-lg font-semibold">{selection.doc.title}</h3>

            <h4 className="mt-3 text-base font-semibold">
              {selection.chapter.title}
            </h4>

            {renderBody(selection.chapter.content, selection.chapter.summary)}
          </article>
        )}
      </div>
    </section>
  );
}
