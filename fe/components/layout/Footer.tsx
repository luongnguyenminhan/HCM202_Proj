import React from "react";

export default function Footer() {
  return (
    <div style={{ width: "100%", padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="typo-muted" style={{ fontSize: 13 }}>© 2025 — HCM Thought RAG</span>
      <a className="typo-muted" style={{ fontSize: 13 }} href="https://example.com" target="_blank" rel="noreferrer">Thông tin dự án</a>
    </div>
  );
}