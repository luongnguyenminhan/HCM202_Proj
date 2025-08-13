"use client";
import { useEffect, useState } from "react";
import { deleteDocument, fetchDocuments } from "@/services/docs";

type Row = {
  id: number;
  title: string;
  summary?: string | null;
  cover_image?: string | null;
  chapter_count: number;
};

export default function DocumentTable() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchDocuments();
      setRows(list);
    } catch (e: any) {
      setError(e?.message || "Tải danh sách thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-semibold">Danh sách tài liệu</h4>
        <div className="flex items-center gap-2">
          <input
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            className="rounded-xl border px-3 py-2"
            placeholder="X-Admin-Token (xoá cần)"
          />
          <button onClick={load} className="rounded-xl border px-3 py-2 hover:bg-accent/40">Làm mới</button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-accent/40">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Tiêu đề</th>
              <th className="px-3 py-2 text-left">Chương</th>
              <th className="px-3 py-2 text-left">Tác vụ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.title}</td>
                <td className="px-3 py-2">{r.chapter_count}</td>
                <td className="px-3 py-2">
                  <button
                    className="rounded-xl border px-3 py-1.5 hover:bg-accent/40 disabled:opacity-60"
                    disabled={deletingId === r.id}
                    onClick={async () => {
                      if (!confirm(`Xoá tài liệu #${r.id}?`)) return;
                      setDeletingId(r.id);
                      try {
                        await deleteDocument(r.id, adminToken || undefined);
                        await load();
                      } catch (e: any) {
                        alert(e?.message || "Xoá thất bại");
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                  >
                    {deletingId === r.id ? "Đang xoá..." : "Xoá"}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-foreground/70">Không có tài liệu</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
