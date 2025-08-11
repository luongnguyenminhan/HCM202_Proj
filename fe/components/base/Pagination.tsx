"use client";

import React from "react";
import Button from "@/components/base/Button";

export type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
};

export default function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = Array.from({ length: totalPages }).slice(0, 7).map((_, i) => i + 1);

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <Button size="sm" disabled={!canPrev} onClick={() => canPrev && onChange(page - 1)}>
        Trước
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          size="sm"
          variant={p === page ? "primary" : "secondary"}
          onClick={() => onChange(p)}
        >
          {p}
        </Button>
      ))}
      <Button size="sm" disabled={!canNext} onClick={() => canNext && onChange(page + 1)}>
        Sau
      </Button>
      <span className="typo-muted" style={{ marginLeft: 8 }}>
        Trang {page}/{totalPages}
      </span>
    </div>
  );
}