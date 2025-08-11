"use client";

import React from "react";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";

export default function HeroBanner() {
  return (
    <Card className="h-full" bodyClassName="flex items-center justify-between">
      <div>
        <div className="typo-h1 mb-1.5">Chatbot RAG — Tư tưởng HCM</div>
        <div className="typo-muted">Tra cứu — Trích dẫn — Học tập</div>
        <div className="mt-3">
          <Button variant="primary" onClick={() => location.assign("/chat")}>Bắt đầu trò chuyện</Button>
        </div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/globe.svg" alt="hero" className="w-[120px] h-[120px]" />
    </Card>
  );
}