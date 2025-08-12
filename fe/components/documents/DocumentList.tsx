"use client";
import { useRef, useState, useLayoutEffect, useEffect, useId } from "react";

export type Chapter = { id: string; title: string; summary: string };
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
    <div className="mt-6 grid gap-8 md:grid-cols-2">
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

/** One document card + collapsible list of chapters */
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
  const regionId = useId(); // unique id for aria-controls
  const headingId = useId();

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] p-6 pb-7">
      <button
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={open}
        aria-controls={regionId}
        aria-labelledby={headingId}
      >
        <h3 id={headingId} className="text-lg font-semibold">
          {doc.title}
        </h3>
        <p className="mt-1 text-foreground/75">{doc.summary}</p>
      </button>

      <Collapsible id={regionId} labelledBy={headingId} open={open}>
        <div className="mt-4 space-y-3 pb-4">
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

/** Height-animated collapsible. No `any`, accessible & smooth. */
function Collapsible({
  id,
  labelledBy,
  open,
  children,
}: {
  id?: string;
  labelledBy?: string;
  open: boolean;
  children: React.ReactNode;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  // Measure before paint to avoid flicker on first expand
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    const measure = () => setHeight(el.scrollHeight);
    measure();

    // Re-measure when content changes
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    }

    // Re-measure on viewport resize (text wrapping changes height)
    const onWinResize = () => measure();
    window.addEventListener("resize", onWinResize);

    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onWinResize);
    };
  }, []);

  // When opening, sync to current content height
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    if (open) setHeight(el.scrollHeight);
  }, [open]);

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      aria-hidden={!open}
      style={{
        height: open ? height : 0,
        transition:
          "height 300ms cubic-bezier(0.22,1,0.36,1), opacity 240ms ease",
        opacity: open ? 1 : 0,
        overflow: "hidden",
        willChange: "height",
        // Prevent clicks/tabbing when closed (fallback for inert)
        pointerEvents: open ? "auto" : "none",
        contain: "layout style paint", // reduce repaints during animation
      }}
    >
      <div ref={innerRef}>{children}</div>
    </div>
  );
}
