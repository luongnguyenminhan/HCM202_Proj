"use client";

import React, { useMemo, useState } from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import { MOCK_ARTICLES } from "@/services/mock";

export default function ArticleDetail() {
  const [articleId] = useState("a1");
  const article = useMemo(() => MOCK_ARTICLES.find((a) => a.id === articleId), [articleId]);

  if (!article) return <Card>Không tìm thấy bài viết</Card>;
  return (
    <Card title={article.title} extra={<Badge>{article.category}</Badge>} bodyClassName="h-[calc(100vh-120px)] overflow-auto">
      <div className="typo-muted mb-1.5">Bởi {article.author} — {new Date(article.date).toLocaleDateString("vi-VN")}</div>
      <div className="typo-body whitespace-pre-wrap">{article.content}</div>
    </Card>
  );
}