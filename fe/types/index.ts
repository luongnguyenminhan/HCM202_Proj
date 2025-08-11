export type ChatRole = "user" | "assistant";

export type RAGSource = {
    chunkId: string;
    documentId: string;
    title: string;
    chapterTitle?: string;
    page?: number;
    snippet: string;
};

export type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    sources?: RAGSource[];
    createdAt: string; // ISO string
};

export type Quote = {
    id: string;
    text: string;
    page?: number;
};

export type Chapter = {
    id: string;
    index: number;
    title: string;
    content: string;
    quotes?: Quote[];
};

export type DocumentMeta = {
    id: string;
    title: string;
    source: string; // ví dụ: "Tuyển tập Hồ Chí Minh"
    year?: number;
    pages?: number;
    tags: string[];
    summary?: string;
    coverImage?: string;
};

export type Document = DocumentMeta & {
    chapters: Chapter[];
};

export type Chunk = {
    id: string;
    documentId: string;
    chapterId?: string;
    content: string;
    page?: number;
    score?: number;
};

export type Article = {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    date: string; // ISO string
    tags: string[];
    category: string;
    coverImage?: string;
    content?: string;
};

export type PaginatedResult<T> = {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
};


