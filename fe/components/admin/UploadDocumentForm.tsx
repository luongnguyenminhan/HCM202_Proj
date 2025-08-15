"use client";
import { useRef, useState } from "react";
import { uploadDocument } from "@/services/docs";

export default function UploadDocumentForm({ onUploaded }: { onUploaded?: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [source, setSource] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const file = fileRef.current?.files?.[0];
        if (!file) { setError("Chọn tệp"); return; }
        const effectiveTitle = title || file.name.replace(/\.[^.]+$/, "");
        setLoading(true);
        try {
          await uploadDocument({ file, title: effectiveTitle, description: description || undefined, source: source || undefined }, adminToken || undefined);
          setTitle(""); setDescription(""); setSource(""); if (fileRef.current) fileRef.current.value = "";
          onUploaded?.();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          setError(err?.message || "Upload thất bại");
        } finally {
          setLoading(false);
        }
      }}
    >
      <div>
        <label className="mb-1 block text-sm">Tệp (PDF/DOCX/TXT)</label>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Tiêu đề</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="Tự suy ra từ tên tệp nếu bỏ trống" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Mô tả</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="h-24 w-full resize-y rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm">Nguồn</label>
        <input value={source} onChange={(e) => setSource(e.target.value)} className="w-full rounded-xl border px-3 py-2" />
      </div>
      <div>
        <label className="mb-1 block text-sm">X-Admin-Token</label>
        <input value={adminToken} onChange={(e) => setAdminToken(e.target.value)} className="w-full rounded-xl border px-3 py-2" placeholder="Nhập nếu backend yêu cầu" />
      </div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      <div className="text-right">
        <button disabled={loading} className="rounded-xl bg-brand px-4 py-2 text-surface hover:bg-brand-600 disabled:opacity-60">
          {loading ? "Đang tải..." : "Tải lên"}
        </button>
      </div>
    </form>
  );
}
