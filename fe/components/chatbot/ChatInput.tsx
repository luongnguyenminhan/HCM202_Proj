"use client";

import React, { useState } from "react";
import TextArea from "@/components/base/TextArea";
import Button from "@/components/base/Button";
import Card from "@/components/base/Card";

export default function ChatInput() {
  const [text, setText] = useState("");

  function handleSend() {
    if (!text.trim()) return;
    alert("Send: " + text);
    setText("");
  }

  return (
    <Card>
      <div className="flex gap-2">
        <TextArea value={text} onChange={setText} placeholder="Nhập câu hỏi về tư tưởng Hồ Chí Minh..." />
        <div className="flex flex-col gap-2">
          <Button variant="primary" onClick={handleSend}>Gửi</Button>
          <Button variant="ghost" onClick={() => setText("")}>Xóa</Button>
        </div>
      </div>
    </Card>
  );
}