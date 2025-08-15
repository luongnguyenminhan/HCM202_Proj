"use client";
import { RefObject, useState } from "react";

/** Message input + Send button */
export default function InputBar({
  inputRef,
  onSend,
  disabled,
}: {
  // allow null because useRef init is null
  inputRef: RefObject<HTMLInputElement | null>;
  onSend: (value: string) => Promise<void>;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="border-t p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = value.trim();
          if (!v) return;
          setSending(true);
          const p = onSend(v);
          setValue("");
          inputRef.current?.focus();
          p.finally(() => setSending(false));
        }}
        className="flex items-center gap-2"
      >
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="flex-1 rounded-xl border px-3 py-2 outline-none"
          placeholder="Nhập câu hỏi..."
          disabled={sending || !!disabled}
        />
        <button className="rounded-xl bg-brand px-4 py-2 text-surface hover:bg-brand-600 disabled:opacity-60" disabled={sending || !!disabled}>
          {sending ? "..." : "Gửi"}
        </button>
      </form>
    </div>
  );
}
