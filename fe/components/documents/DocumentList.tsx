"use client";
import { useRef, useState, useLayoutEffect, useEffect, useId } from "react";

export type Chapter = { 
  id: string; 
  title: string; 
  summary: string;
  content?: string;
};
export type Doc = {
  id: string;
  title: string;
  summary: string;
  chapters: Chapter[];
};

export default function DocumentList({
  docs,
  expandedId,
  onToggle,
  onSeeDetail,
}: {
  docs: Doc[];
  expandedId: string | null;
  onToggle: (docId: string) => void;
  onSeeDetail: (docId: string, chapterId: string) => void;
}) {
  return (
    // 1 cột (mobile) → 2 cột (md) → 3 cột (lg)
    <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {docs.map((doc) => (
        <DocCard
          key={doc.id}
          doc={doc}
          open={expandedId === doc.id}
          onToggle={() => onToggle(doc.id)}
          onSeeDetail={onSeeDetail}
        />
      ))}
    </div>
  );
}

function DocCard({
  doc,
  open,
  onToggle,
  onSeeDetail,
}: {
  doc: Doc;
  open: boolean;
  onToggle: () => void;
  onSeeDetail: (docId: string, chapterId: string) => void;
}) {
  const regionId = useId();

  return (
    <div className="h-full rounded-2xl border border-[color:var(--color-border)] p-5">
      {/* Chỉ giữ tiêu đề, BỎ summary của title lớn */}
      <button
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
        aria-controls={regionId}
      >
        <h3 className="text-base font-semibold md:text-lg">{doc.title}</h3>
      </button>

      <Collapsible id={regionId} open={open}>
        <div className="mt-3 space-y-2">
          {doc.chapters.map((ch, idx) => (
            <div key={ch.id} className="rounded-xl border">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="min-w-0">
                  <div className="font-medium">
                    {idx + 1}. {ch.title}
                  </div>
                  <div className="text-sm text-foreground/70">{ch.summary}</div>
                </div>
                <button
                  className="shrink-0 rounded-full border px-3 py-1.5 text-sm hover:bg-accent/40"
                  onClick={() => onSeeDetail(doc.id, ch.id)}
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>
    </div>
  );
}

function Collapsible({
  id,
  open,
  children,
}: {
  id?: string;
  open: boolean;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = innerRef.current;
    if (open && el) setHeight(el.scrollHeight);
  }, [open]);

  return (
    <div
      id={id}
      aria-hidden={!open}
      style={{
        height: open ? height + 2 : 0, // +2px đệm để không bị cắt viền
        transition:
          "height 300ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease",
        opacity: open ? 1 : 0,
        overflow: "hidden",
        willChange: "height",
      }}
    >
      {/* flow-root + pb-1 phá margin-collapse ở đáy */}
      <div ref={innerRef} className="flow-root pb-1">
        {children}
      </div>
    </div>
  );
}

