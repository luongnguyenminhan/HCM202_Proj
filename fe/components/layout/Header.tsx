"use client";

import React from "react";
import Button from "@/components/base/Button";

export default function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, width: "100%", padding: "0 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/window.svg" alt="logo" width={28} height={28} />
        <strong>HCM Thought — RAG</strong>
      </div>
      <nav style={{ display: "flex", gap: 8 }}>
        <Button variant="ghost" onClick={() => location.assign("/")}>Home</Button>
        <Button variant="ghost" onClick={() => location.assign("/chat")}>Chat</Button>
        <Button variant="ghost" onClick={() => location.assign("/documents")}>Tài liệu</Button>
        <Button variant="ghost" onClick={() => location.assign("/articles")}>Phân tích</Button>
        <Button variant="ghost" onClick={() => location.assign("/admin")}>Admin</Button>
      </nav>
    </div>
  );
}