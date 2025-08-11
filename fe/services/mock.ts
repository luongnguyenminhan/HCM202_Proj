import { Article, ChatMessage, Document, DocumentMeta, PaginatedResult, RAGSource } from "@/types";

function iso(date: string): string { return new Date(date).toISOString(); }

export const MOCK_ARTICLES: Article[] = [
    {
        id: "a1",
        title: "Dĩ bất biến, ứng vạn biến: Nền tảng tư tưởng trong đối ngoại",
        excerpt: "Giải thích khái niệm và ứng dụng trong bối cảnh cách mạng và xây dựng đất nước.",
        author: "Nhóm nghiên cứu HCM",
        date: iso("2024-01-10"),
        tags: ["tư tưởng", "đối ngoại", "chiến lược"],
        category: "Cơ sở tư tưởng",
        coverImage: "/window.svg",
        content: "Bài viết phân tích câu nói 'Dĩ bất biến, ứng vạn biến'..."
    },
    {
        id: "a2",
        title: "Ngoại giao Cây tre Việt Nam: Bản sắc và hiện đại",
        excerpt: "Tính mềm dẻo, kiên định và nhân văn trong đường lối ngoại giao.",
        author: "PR Team",
        date: iso("2024-02-14"),
        tags: ["ngoại giao", "bản sắc"],
        category: "Thực tiễn hiện đại",
        coverImage: "/globe.svg",
        content: "Ngoại giao cây tre như một hình tượng mô tả..."
    },
    {
        id: "a3",
        title: "Liên hệ Tư tưởng và Thực tiễn: Từ 'Bất biến' đến 'Cây tre'",
        excerpt: "Cầu nối giữa nền tảng tư tưởng và phương châm hành động trong ngoại giao.",
        author: "Biên tập",
        date: iso("2024-03-02"),
        tags: ["liên hệ", "phương châm"],
        category: "Phân tích chuyên đề",
        coverImage: "/file.svg",
        content: "Bài viết tổng hợp liên hệ hai phạm trù..."
    },
    {
        id: "a4",
        title: "Tư tưởng đoàn kết quốc tế trong thời đại số",
        excerpt: "Vai trò của công nghệ trong lan tỏa thông điệp hòa bình và hữu nghị.",
        author: "Nhóm nghiên cứu HCM",
        date: iso("2024-03-20"),
        tags: ["đoàn kết", "công nghệ"],
        category: "Cập nhật thời sự",
        coverImage: "/next.svg",
    },
    {
        id: "a5",
        title: "Học tập và làm theo tấm gương đạo đức Hồ Chí Minh",
        excerpt: "Những ví dụ thực tiễn trong giáo dục và công vụ.",
        author: "Biên tập",
        date: iso("2024-04-05"),
        tags: ["đạo đức", "giáo dục"],
        category: "Giáo dục",
        coverImage: "/vercel.svg",
    },
    {
        id: "a6",
        title: "Xây dựng văn hóa ngoại giao nhân văn",
        excerpt: "Giữ vững nguyên tắc, đề cao hợp tác và phát triển bền vững.",
        author: "PR Team",
        date: iso("2024-04-18"),
        tags: ["ngoại giao", "nhân văn"],
        category: "Thực tiễn hiện đại",
        coverImage: "/globe.svg",
    },
    {
        id: "a7",
        title: "Tinh thần độc lập tự cường trong hội nhập",
        excerpt: "Tự lực tự cường là nền tảng để hội nhập thành công.",
        author: "Nhóm nghiên cứu HCM",
        date: iso("2024-05-01"),
        tags: ["độc lập", "tự cường"],
        category: "Cơ sở tư tưởng",
        coverImage: "/window.svg",
    },
    {
        id: "a8",
        title: "Giữ gìn bản sắc trong giao lưu văn hóa",
        excerpt: "Hòa nhập nhưng không hòa tan trong thời kỳ toàn cầu hóa.",
        author: "Biên tập",
        date: iso("2024-05-20"),
        tags: ["bản sắc", "văn hóa"],
        category: "Phân tích chuyên đề",
        coverImage: "/file.svg",
    },
    {
        id: "a9",
        title: "Chuyển đổi số trong truyền thông tư tưởng",
        excerpt: "Sử dụng công cụ số để phổ biến tri thức một cách minh bạch.",
        author: "PR Team",
        date: iso("2024-06-02"),
        tags: ["chuyển đổi số", "truyền thông"],
        category: "Cập nhật thời sự",
        coverImage: "/next.svg",
    },
    {
        id: "a10",
        title: "Tư duy chiến lược và nghệ thuật ứng xử",
        excerpt: "Linh hoạt, mềm dẻo nhưng kiên định mục tiêu.",
        author: "Nhóm nghiên cứu HCM",
        date: iso("2024-06-22"),
        tags: ["chiến lược", "ứng xử"],
        category: "Cơ sở tư tưởng",
        coverImage: "/window.svg",
    },
    {
        id: "a11",
        title: "Tuổi trẻ với khát vọng phụng sự",
        excerpt: "Tổ chức hoạt động tình nguyện và nghiên cứu khoa học xã hội.",
        author: "Biên tập",
        date: iso("2024-07-04"),
        tags: ["tuổi trẻ", "phụng sự"],
        category: "Giáo dục",
        coverImage: "/vercel.svg",
    },
    {
        id: "a12",
        title: "Kết nối bạn bè quốc tế vì hòa bình",
        excerpt: "Sáng kiến giao lưu nhân dân và hợp tác học thuật.",
        author: "PR Team",
        date: iso("2024-07-20"),
        tags: ["hữu nghị", "hòa bình"],
        category: "Thực tiễn hiện đại",
        coverImage: "/globe.svg",
    }
];

export const MOCK_DOCUMENTS: Document[] = [
    {
        id: "d1",
        title: "Tuyển tập Hồ Chí Minh — Tập 1",
        source: "NXB Chính trị quốc gia",
        year: 2011,
        pages: 420,
        tags: ["cách mạng", "đoàn kết"],
        summary: "Tổng hợp các bài viết và bài nói giai đoạn đầu.",
        coverImage: "/vercel.svg",
        chapters: [
            {
                id: "c1",
                index: 1,
                title: "Về đoàn kết quốc tế",
                content: "Đoàn kết, đoàn kết, đại đoàn kết. Thành công, thành công, đại thành công...",
                quotes: [
                    { id: "q1", text: "Đoàn kết là sức mạnh.", page: 12 },
                    { id: "q2", text: "Muốn đi xa phải đi cùng nhau.", page: 15 }
                ]
            },
            {
                id: "c2",
                index: 2,
                title: "Tư tưởng nhất quán 'Dĩ bất biến, ứng vạn biến'",
                content: "Giữ vững mục tiêu độc lập, tự do; linh hoạt trong phương pháp...",
            }
        ]
    },
    {
        id: "d2",
        title: "Toàn văn bài nói chuyện — Ngoại giao và đoàn kết",
        source: "Lưu trữ Quốc gia",
        year: 1966,
        pages: 86,
        tags: ["ngoại giao", "hữu nghị"],
        summary: "Bài nói về vai trò bạn bè quốc tế và hòa bình.",
        chapters: [
            { id: "c3", index: 1, title: "Bạn bè năm châu", content: "Việt Nam sẵn sàng là bạn..." },
            { id: "c4", index: 2, title: "Tình hữu nghị", content: "Tình hữu nghị thủy chung..." }
        ]
    }
];

export const MOCK_SOURCES: RAGSource[] = [
    {
        chunkId: "k1",
        documentId: "d1",
        title: "Về đoàn kết quốc tế",
        chapterTitle: "Chương 1",
        page: 12,
        snippet: "Đoàn kết, đoàn kết, đại đoàn kết..."
    },
    {
        chunkId: "k2",
        documentId: "d1",
        title: "Dĩ bất biến, ứng vạn biến",
        chapterTitle: "Chương 2",
        page: 65,
        snippet: "Giữ vững mục tiêu, linh hoạt phương pháp..."
    },
    {
        chunkId: "k3",
        documentId: "d2",
        title: "Ngoại giao hữu nghị",
        chapterTitle: "Chương 1",
        page: 7,
        snippet: "Bạn bè năm châu..."
    },
];

export const MOCK_CHAT: ChatMessage[] = [
    {
        id: "m1",
        role: "user",
        content: "Giải thích 'Dĩ bất biến, ứng vạn biến'?",
        createdAt: iso("2025-05-01T10:00:00Z")
    },
    {
        id: "m2",
        role: "assistant",
        content: "Theo văn bản gốc, 'bất biến' là mục tiêu độc lập - tự do...",
        createdAt: iso("2025-05-01T10:00:01Z"),
        sources: MOCK_SOURCES
    },
    {
        id: "m3",
        role: "user",
        content: "Giải thích 'Tình hữu nghị'?",
        createdAt: iso("2025-05-01T10:00:00Z")
    },
    {
        id: "m4",
        role: "assistant",
        content: "Đối ngoại là cuộc sống thực sự của bất kỳ nước nào, quốc gia nào...",
        createdAt: iso("2025-05-01T10:00:01Z"),
        sources: MOCK_SOURCES
    },
    {
        id: "m5",
        role: "user",
        content: "Giải thích 'Ngoại giao'?",
        createdAt: iso("2025-05-01T10:00:00Z")
    },
    {
        id: "m6",
        role: "assistant",
        content: "Ngoại giao là việc những quốc gia khác nhau thông minh, định hình...",
        createdAt: iso("2025-05-01T10:00:01Z"),
        sources: MOCK_SOURCES
    },
];

export function paginate<T>(items: T[], page: number, pageSize: number): PaginatedResult<T> {
    const start = (page - 1) * pageSize;
    const sliced = items.slice(start, start + pageSize);
    return { items: sliced, total: items.length, page, pageSize };
}

export function listCategories(): string[] {
    const set = new Set(MOCK_ARTICLES.map(a => a.category));
    return Array.from(set);
}

export function listTags(): string[] {
    const set = new Set(MOCK_ARTICLES.flatMap(a => a.tags));
    return Array.from(set);
}

export function getArticles(page = 1, pageSize = 6): PaginatedResult<Article> {
    return paginate(MOCK_ARTICLES, page, pageSize);
}

export function getDocumentsMeta(): DocumentMeta[] {
    return MOCK_DOCUMENTS.map((d) => ({
        id: d.id,
        title: d.title,
        source: d.source,
        year: d.year,
        pages: d.pages,
        tags: d.tags,
        summary: d.summary,
        coverImage: d.coverImage,
    }));
}

export function getDocumentById(id: string): Document | undefined {
    return MOCK_DOCUMENTS.find(d => d.id === id);
}

export function getChatHistory(): ChatMessage[] {
    return MOCK_CHAT;
}

export function getTopSources(limit = 5): RAGSource[] {
    return MOCK_SOURCES.slice(0, limit);
}


