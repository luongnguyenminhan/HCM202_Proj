"use client";

import React from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import { DocumentMeta } from "@/types";

export type DocumentCardProps = {
  doc: DocumentMeta;
  onOpen?: (docId: string) => void;
};

export default function DocumentCard({ doc, onOpen }: DocumentCardProps) {
  return (
    <Card>
      <div style={{ display: "flex", gap: 12 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={doc.coverImage ?? "/file.svg"} alt={doc.title} width={56} height={56} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{doc.title}</strong>
            <Badge>{doc.year ?? "N/A"}</Badge>
          </div>
          <div className="typo-muted" style={{ marginTop: 4, fontSize: 13 }}>{doc.source}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
            {doc.tags.map((t) => (
              <Badge key={t}>{t}</Badge>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <Button size="sm" variant="primary" onClick={() => onOpen?.(doc.id)}>Xem chương</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}