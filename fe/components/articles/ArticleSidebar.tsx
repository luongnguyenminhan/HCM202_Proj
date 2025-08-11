"use client";

import React from "react";
import Card from "@/components/base/Card";
import Badge from "@/components/base/Badge";
import { listCategories, listTags } from "@/services/mock";

export default function ArticleSidebar() {
  const categories = listCategories();
  const tags = listTags();
  return (
    <div className="grid gap-3 h-[calc(100vh-120px)] overflow-auto">
      <Card title="Chuyên mục" bodyClassName="flex flex-wrap gap-2">
        {categories.map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </Card>
      <Card title="Từ khóa" bodyClassName="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </Card>
    </div>
  );
}