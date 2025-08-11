"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import Pagination from "@/components/base/Pagination";
import { getArticles } from "@/services/mock";

export default function ArticleList() {
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const res = useMemo(() => getArticles(page, pageSize), [page]);

  return (
    <Card title="Bài viết" bodyClassName="h-[calc(100vh-180px)] overflow-auto grid gap-3">
      {res.items.map((a) => (
        <div key={a.id} className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <strong>{a.title}</strong>
              <span className="typo-muted text-[12px]">{new Date(a.date).toLocaleDateString("vi-VN")}</span>
            </div>
            <div className="typo-muted my-1.5">{a.excerpt}</div>
            <div className="flex gap-1.5 flex-wrap">
              <Badge>{a.category}</Badge>
              {a.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <div className="mt-2">
              <Button size="sm" onClick={() => alert(`Open article ${a.id}`)}>Đọc tiếp</Button>
            </div>
          </div>
        </div>
      ))}
      <Pagination page={page} pageSize={pageSize} total={res.total} onChange={setPage} />
    </Card>
  );
}