"use client";

import React, { useMemo, useRef, useEffect } from "react";
import Card from "@/components/base/Card";
import ChatMessage from "./ChatMessage";
import { getChatHistory } from "@/services/mock";

export default function ChatWindow() {
  const messages = useMemo(() => getChatHistory(), []);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card title="Chatbot" bodyClassName="flex flex-col gap-3">
      <div className="flex-1 overflow-auto grid gap-3 min-h-[calc(80vh-120px)] max-h-[calc(80vh-120px)]">
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onReport={(id) => alert(`Báo cáo tin nhắn ${id}`)} />
          ))}
        </div>
        <div ref={endRef} />
      </div>
    </Card>
  );
}