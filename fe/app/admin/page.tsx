"use client";
import UploadDocumentForm from "@/components/admin/UploadDocumentForm";
import DocumentTable from "@/components/admin/DocumentTable";
import { useState } from "react";

export default function AdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <h2 className="text-xl font-semibold">Quản trị tài liệu</h2>
      <div className="rounded-2xl border p-4">
        <h3 className="mb-3 text-base font-semibold">Tải lên tài liệu</h3>
        <UploadDocumentForm onUploaded={() => setRefreshKey((k) => k + 1)} />
      </div>
      <div key={refreshKey} className="rounded-2xl border p-4">
        <DocumentTable />
      </div>
    </div>
  );
}


