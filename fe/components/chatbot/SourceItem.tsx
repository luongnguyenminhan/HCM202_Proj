"use client";

import React from "react";
import Badge from "@/components/base/Badge";
import { RAGSource } from "@/types";

export type SourceItemProps = { source: RAGSource };

export default function SourceItem({ source }: SourceItemProps) {
  return (
    <div className="card">
      <div className="card-body">
        <div className="flex justify-between items-center mb-1.5">
          <strong>{source.title}</strong>
          {typeof source.page === "number" && <Badge>Trang {source.page}</Badge>}
        </div>
        <div className="typo-muted text-[13px]">{source.snippet}</div>
        <div className="mt-1.5 text-[12px]">
          <span className="typo-muted">Doc ID: {source.documentId}</span>
        </div>
      </div>
    </div>
  );
}