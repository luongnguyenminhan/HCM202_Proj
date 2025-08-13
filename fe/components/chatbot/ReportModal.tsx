"use client";

import { useEffect, useRef, useState } from "react";
import { useLockBodyScroll } from "./hooks";
import { postChatReport } from "@/services/chat";

/**
 * ReportModal: lightweight feedback form for incorrect data.
 * - Locks page scroll when open.
 * - Autofocuses the first input.
 * - Shows a thank-you screen after submit.
 */
export default function ReportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll(open);

  // Focus first field each time the modal opens
  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    titleRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await postChatReport({ referenceId: title || "unknown", reason: desc.trim(), source: email ? `email:${email}` : undefined });
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Gửi báo cáo thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-surface p-5 shadow-xl">
        <h4 className="mb-3 text-lg font-semibold">Báo cáo dữ liệu sai lệch</h4>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm">Liên kết / Chủ đề</label>
              <input
                ref={titleRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Ví dụ: Chương 2, mục 3 hoặc dán URL"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Mô tả vấn đề *</label>
              <textarea
                className="h-28 w-full resize-y rounded-xl border px-3 py-2"
                placeholder="Mô tả phần thông tin sai, trích dẫn chưa khớp, bối cảnh..."
                required
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">
                Email liên hệ (tuỳ chọn)
              </label>
              <input
                type="email"
                className="w-full rounded-xl border px-3 py-2"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error ? (
              <div className="text-sm text-red-600">{error}</div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                className="rounded-xl border px-4 py-2 hover:bg-accent/40"
                onClick={onClose}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="rounded-xl bg-brand px-4 py-2 text-surface hover:bg-brand-600 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Đang gửi..." : "Gửi báo cáo"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-foreground">
              Cảm ơn bạn! Phản hồi đã được ghi nhận. Chúng tôi sẽ xem xét và cập
              nhật dữ liệu sớm nhất.
            </p>
            <div className="text-right">
              <button
                className="rounded-xl bg-brand px-4 py-2 text-surface hover:bg-brand-600"
                onClick={onClose}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
