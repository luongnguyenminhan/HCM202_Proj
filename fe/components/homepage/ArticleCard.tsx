"use client";

import React from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import { Article } from "@/types";

export type ArticleCardProps = { article: Article };

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card>
      <div className="flex gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.coverImage ?? "/next.svg"} alt={article.title} className="w-[60px] h-[60px]" />
        <div>
          <strong>{article.title}</strong>
          <div className="typo-muted text-[13px]">{article.excerpt}</div>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <Badge>{article.category}</Badge>
            {article.tags.map((t) => <Badge key={t}>{t}</Badge>)}
          </div>
          <div className="mt-2">
            <Button size="sm">Đọc</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}