"use client";

import React from "react";
import Card from "@/components/base/Card";
import ArticleCard from "./ArticleCard";
import Button from "@/components/base/Button";
import { MOCK_ARTICLES } from "@/services/mock";

export default function LatestArticles() {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const latest = React.useMemo(
    () => [...MOCK_ARTICLES].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    []
  );

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const itemWidth = 300; // px
    el.scrollBy({ left: direction * itemWidth, behavior: "smooth" });
  };

  return (
    <Card title="Bài viết mới">
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="typo-muted text-sm">Kéo ngang hoặc dùng nút để xem thêm</div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => scrollBy(-1)}>
              ← Trước
            </Button>
            <Button size="sm" variant="ghost" onClick={() => scrollBy(1)}>
              Sau →
            </Button>
          </div>
        </div>
        <div
          ref={scrollerRef}
          className="flex gap-4 max-w-[calc(100vw-180px)] overflow-x-auto snap-x snap-mandatory pb-2"
        >
          {latest.map((a) => (
            <div key={a.id} className="min-w-[500px] snap-start">
              <ArticleCard article={a} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}