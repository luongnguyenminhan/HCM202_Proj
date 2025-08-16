const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://api.hcm202.wc504.io.vn";
const STRIPPED_BASE = RAW_API_BASE.replace(/\/+$/, "");
const API_BASE = /\/api\/v\d+$/i.test(STRIPPED_BASE) ? STRIPPED_BASE : `${STRIPPED_BASE}/api/v1`;

export type DocumentListItem = {
  id: number;
  title: string;
  summary?: string | null;
  cover_image?: string | null;
  chapter_count: number;
};

export type DocumentListResponse = {
  documents: DocumentListItem[];
};

export async function fetchDocuments(): Promise<DocumentListItem[]> {
  const res = await fetch(`${API_BASE}/docs/list`, { cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Fetch documents failed: ${res.status} ${t}`);
  }
  const data = (await res.json()) as DocumentListResponse;
  return data.documents || [];
}

export async function deleteDocument(documentId: number, adminToken?: string): Promise<{ deleted_document_id: number }> {
  const url = new URL(`${API_BASE}/corpus/delete`);
  url.searchParams.set("document_id", String(documentId));
  const res = await fetch(url.toString(), {
    method: "DELETE",
    headers: {
      ...(adminToken ? { "X-Admin-Token": adminToken } : {}),
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Delete failed: ${res.status} ${t}`);
  }
  return res.json();
}

export async function uploadDocument(
  params: { file: File; title: string; description?: string; source?: string },
  adminToken?: string,
): Promise<{ status: string; document_id: number; chapter_count: number; chunk_count: number }> {
  const fd = new FormData();
  fd.append("file", params.file);
  fd.append("title", params.title);
  if (params.description) fd.append("description", params.description);
  if (params.source) fd.append("source", params.source);
  const res = await fetch(`${API_BASE}/corpus/upload`, {
    method: "POST",
    headers: {
      ...(adminToken ? { "X-Admin-Token": adminToken } : {}),
    },
    body: fd,
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Upload failed: ${res.status} ${t}`);
  }
  return res.json();
}

export type ChapterSummary = { id: number; title: string; summary?: string | null; ordering: number };
export type DocumentDetailResponse = { id: number; title: string; summary?: string | null; cover_image?: string | null; chapters: ChapterSummary[] };

export async function fetchDocumentDetail(docId: number): Promise<DocumentDetailResponse> {
  const res = await fetch(`${API_BASE}/docs/${docId}`, { cache: "no-store" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Fetch document detail failed: ${res.status} ${t}`);
  }
  return res.json();
}


