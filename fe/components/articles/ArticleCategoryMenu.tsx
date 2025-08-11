"use client";

import React, { useState } from "react";
import Card from "@/components/base/Card";
import Select from "@/components/base/Select";
import { listCategories } from "@/services/mock";

export default function ArticleCategoryMenu() {
  const [cat, setCat] = useState<string>("");
  const options = [{ label: "Tất cả", value: "" }, ...listCategories().map((c) => ({ label: c, value: c }))];
  return (
    <Card title="Lọc chuyên mục">
      <Select options={options} value={cat} onChange={setCat} />
    </Card>
  );
}