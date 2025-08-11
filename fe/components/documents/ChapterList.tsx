"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import { getDocumentById } from "@/services/mock";

export default function ChapterList() {
  const [docId] = useState("d1");
  const doc = useMemo(() => getDocumentById(docId), [docId]);

  if (!doc) return <Card>Không có chương</Card>;
  return (
    <Card title="Danh sách chương">
      <div style={{ display: "grid", gap: 8 }}>
        {doc.chapters.map((c) => (
          <div key={c.id} className="card">
            <div className="card-body" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <strong>{c.index}. {c.title}</strong>
                <div className="typo-muted" style={{ fontSize: 13, marginTop: 2 }}>{c.content.slice(0, 80)}...</div>
              </div>
              <Button size="sm" onClick={() => alert(`Open chapter ${c.id}`)}>Xem</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}