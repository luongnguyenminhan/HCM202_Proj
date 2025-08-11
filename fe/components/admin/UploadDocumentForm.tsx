"use client";

import React, { useState } from "react";
import Card from "@/components/base/Card";
import Input from "@/components/base/Input";
import TextArea from "@/components/base/TextArea";
import Button from "@/components/base/Button";

export default function UploadDocumentForm() {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [summary, setSummary] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Upload: ${title} — ${source} — ${summary.slice(0, 30)}...`);
    setTitle("");
    setSource("");
    setSummary("");
  }

  return (
    <Card title="Upload tài liệu">
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          <div className="typo-muted" style={{ marginBottom: 4 }}>Tiêu đề</div>
          <Input value={title} onChange={setTitle} placeholder="Tên tài liệu" />
        </label>
        <label>
          <div className="typo-muted" style={{ marginBottom: 4 }}>Nguồn</div>
          <Input value={source} onChange={setSource} placeholder="Nguồn/Cơ quan" />
        </label>
        <label>
          <div className="typo-muted" style={{ marginBottom: 4 }}>Tóm tắt</div>
          <TextArea value={summary} onChange={setSummary} placeholder="Mô tả ngắn..." />
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button type="reset" variant="ghost" onClick={() => { setTitle(""); setSource(""); setSummary(""); }}>Xóa</Button>
          <Button type="submit" variant="primary">Tải lên</Button>
        </div>
      </form>
    </Card>
  );
}