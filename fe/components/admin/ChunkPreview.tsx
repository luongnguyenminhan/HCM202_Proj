"use client";

import React from "react";
import Card from "@/components/base/Card";
import { MOCK_SOURCES } from "@/services/mock";

export default function ChunkPreview() {
  const chunks = MOCK_SOURCES;
  return (
    <Card title="Xem trước chunk">
      <div style={{ display: "grid", gap: 8 }}>
        {chunks.map((c) => (
          <div key={c.chunkId} className="card">
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong>{c.title}</strong>
                <span className="typo-muted">tr. {c.page ?? "?"}</span>
              </div>
              <div className="typo-muted" style={{ fontSize: 13, marginTop: 4 }}>{c.snippet}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}