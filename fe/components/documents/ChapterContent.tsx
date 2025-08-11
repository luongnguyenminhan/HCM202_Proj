"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import { getDocumentById } from "@/services/mock";

export default function ChapterContent() {
  const [docId] = useState("d1");
  const [chapterIndex] = useState(1);
  const chapter = useMemo(() => getDocumentById(docId)?.chapters.find((c) => c.index === chapterIndex), [docId, chapterIndex]);

  if (!chapter) return <Card>Chưa chọn chương</Card>;
  return (
    <Card title={chapter.title} extra={<Badge>Chương {chapter.index}</Badge>}>
      <div className="typo-body" style={{ whiteSpace: "pre-wrap" }}>{chapter.content}
      </div>
      {chapter.quotes && chapter.quotes.length > 0 && (
        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          {chapter.quotes.map((q) => (
            <div key={q.id} className="card">
              <div className="card-body" style={{ fontStyle: "italic" }}>
                “{q.text}” {typeof q.page === "number" ? <span className="typo-muted">(tr. {q.page})</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}