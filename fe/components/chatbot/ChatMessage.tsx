"use client";

import React from "react";
import Avatar from "@/components/base/Avatar";
import Badge from "@/components/base/Badge";
import Button from "@/components/base/Button";
import { ChatMessage as ChatMessageType } from "@/types";
import SourceList from "./SourceList";

export type ChatMessageProps = {
  message: ChatMessageType;
  onReport?: (messageId: string) => void;
};

export default function ChatMessage({ message, onReport }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  return (
    <div className="flex gap-3 items-start">
      <Avatar name={isAssistant ? "A" : "U"} />
      <div className="flex-1">
        <div className="flex gap-2 items-center mb-1">
          <Badge variant={isAssistant ? "solid" : "outline"}>{isAssistant ? "Assistant" : "Bạn"}</Badge>
          <span className="typo-muted text-[12px]">{new Date(message.createdAt).toLocaleString("vi-VN")}</span>
          {isAssistant && (
            <Button size="sm" variant="ghost" onClick={() => onReport?.(message.id)}>
              Báo cáo sai lệch
            </Button>
          )}
        </div>
        <div className="card bg-[var(--surface-muted)]">
          <div className="card-body whitespace-pre-wrap">{message.content}</div>
        </div>
        {isAssistant && message.sources && message.sources.length > 0 && (
          <div className="mt-2">
            <SourceList sources={message.sources} />
          </div>
        )}
      </div>
    </div>
  );
}