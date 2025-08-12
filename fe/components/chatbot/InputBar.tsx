"use client";
import { RefObject, useState } from "react";

/** Message input + Send button */
export default function InputBar({
  inputRef,
  onSend,
}: {
  // allow null because useRef init is null
  inputRef: RefObject<HTMLInputElement | null>;
  onSend: (value: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="border-t p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (!v) return;
          onSend(v);
          setValue("");
          inputRef.current?.focus();
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-xl border px-3 py-2 outline-none"
          placeholder="Nhập câu hỏi..."
        />
        <button className="rounded-xl bg-brand px-4 py-2 text-surface hover:bg-brand-600">
          Gửi
        </button>
      </form>
    </div>
  );
}
