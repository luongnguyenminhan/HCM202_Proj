"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import { getDocumentById } from "@/services/mock";

export default function DocumentDetail() {
  const [docId] = useState("d1");
  const doc = useMemo(() => getDocumentById(docId), [docId]);

  if (!doc) return <Card>Không tìm thấy tài liệu</Card>;
  return (
    <Card title={doc.title} extra={<Badge>{doc.year ?? ""}</Badge>}>
      <div className="typo-muted" style={{ marginBottom: 8 }}>{doc.source}</div>
      <div style={{ fontSize: 14 }}>{doc.summary}</div>
    </Card>
  );
}