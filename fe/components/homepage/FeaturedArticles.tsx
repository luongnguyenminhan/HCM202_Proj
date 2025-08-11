"use client";

import React from "react";
import Card from "@/components/base/Card";
import ArticleCard from "./ArticleCard";
import { MOCK_ARTICLES } from "@/services/mock";

export default function FeaturedArticles() {
  const featured = MOCK_ARTICLES.slice(0, 3);
  return (
    <Card title="Nổi bật" bodyClassName="grid gap-3">
      {featured.map((a) => (
        <ArticleCard key={a.id} article={a} />
      ))}
    </Card>
  );
}