"use client";

import { useMemo, useState } from "react";
import DocumentList from "@/components/documents/DocumentList";
import DocumentDetail from "@/components/documents/DocumentDetail";
import { DOCS } from "@/components/homepage/data/docs.data";

/**
 * DocsSection
 * - Accordion: only one document card expanded at a time.
 * - When "Xem chi tiết" is clicked, render the detail panel right below and
 *   smooth–scroll to the section top so BOTH the list and the detail are in view.
 * - No visual separator line between the list and the detail (no border-top).
 */
export default function DocsSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sel, setSel] = useState<{ docId: string; chapterId: string } | null>(
    null
  );

  const selection = useMemo(() => {
    if (!sel) return null;
    const doc = DOCS.find((d) => d.id === sel.docId);
    const chapter = doc?.chapters.find((c) => c.id === sel.chapterId);
    return doc && chapter ? { doc, chapter } : null;
  }, [sel]);

  const handleToggle = (docId: string) => {
    setExpandedId((cur) => (cur === docId ? null : docId));
  };

  const handleSeeDetail = (docId: string, chapterId: string) => {
    setSel({ docId, chapterId });

    const section = document.getElementById("docs");
    const HEADER_H = 72;
    if (section) {
      requestAnimationFrame(() => {
        const y =
          section.getBoundingClientRect().top + window.scrollY - HEADER_H;
        window.scrollTo({ top: y, behavior: "smooth" });
      });
    }
  };

  return (
    <section id="docs" className="mt-12 pt-10 scroll-mt-[72px]">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-2xl font-bold md:text-3xl">Tài liệu</h2>
        <p className="mt-2 text-foreground/75">
          Danh sách tài liệu, tóm tắt ngắn và mục lục theo chương.
        </p>

        <div className="mt-6">
          <DocumentList
            docs={DOCS}
            expandedId={expandedId}
            onToggle={handleToggle}
            onSeeDetail={handleSeeDetail}
          />
        </div>
      </div>

      <div
        id="docs-detail"
        className="mx-auto px-4 mt-10"
        aria-hidden={!selection}
        aria-live="polite"
        style={{
          transition:
            "opacity 280ms cubic-bezier(0.22,1,0.36,1), transform 280ms cubic-bezier(0.22,1,0.36,1)",
          opacity: selection ? 1 : 0,
          transform: selection ? "translateY(0)" : "translateY(6px)",
          pointerEvents: selection ? "auto" : "none",
        }}
      >
        <DocumentDetail selection={selection} />
      </div>
    </section>
  );
}
