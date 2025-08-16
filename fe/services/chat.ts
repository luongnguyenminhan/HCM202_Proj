/* eslint-disable @typescript-eslint/no-explicit-any */
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://160.191.88.194:11112";
const STRIPPED_BASE = RAW_API_BASE.replace(/\/+$/, "");
const API_BASE = /\/api\/v\d+$/i.test(STRIPPED_BASE)
    ? STRIPPED_BASE
    : `${STRIPPED_BASE}/api/v1`;

export type ChatSource = {
    document_id: number;
    chapter_id: number;
    chunk_id: number;
    page_number?: number;
    text: string;
    score?: number;
    url?: string;
};

export type ChatDebugInfo = {
    retrieved_chunks: number[];
    query_time_ms?: number;
    vector_search_time_ms?: number;
};

export type ChatResponse = {
    answer: string;
    sources: ChatSource[];
    num_citations: number;
    debug?: ChatDebugInfo;
};

export type StreamEventType = "start" | "retrieval" | "sources" | "token" | "done" | "error";

export type ChatStreamEvent = {
    type: StreamEventType;
    data: { token?: string } & Record<string, unknown>;
};

export async function postChatQuery(question: string, includeDebug = false, sessionId?: string): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(sessionId ? { "X-Session-Id": sessionId } : {}),
        },
        body: JSON.stringify({ question, include_debug: includeDebug }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Chat query failed: ${res.status} ${text}`);
    }
    return res.json();
}

export function streamChat(
    q: string,
    opts: { includeDebug?: boolean; sessionId?: string } = {},
    onEvent?: (evt: ChatStreamEvent) => void,
    onError?: (e: unknown) => void,
) {
    const { includeDebug = false } = opts;
    const url = new URL(`${API_BASE}/chat/stream`);
    url.searchParams.set("q", q);
    url.searchParams.set("include_debug", String(includeDebug));

    // Native EventSource does not support custom headers; backend header is optional
    const es = new EventSource(url.toString());

    const handle = (type: StreamEventType) => (ev: MessageEvent) => {
        try {
            const parsed = JSON.parse(ev.data) as ChatStreamEvent;
            if (!onEvent) return;
            // Chuẩn hoá payload để FE dùng thống nhất: token event luôn có data.token
            if (type === "token") {
                const text = (parsed as any)?.data?.text ?? (parsed as any)?.data?.token ?? "";
                const data = { ...(parsed.data || {}), token: text } as Record<string, unknown>;
                onEvent({ type, data });
                return;
            }
            onEvent({ type, data: parsed.data || {} });
        } catch (e) {
            if (onError) {
                onError(e);
            }
        }
    };

    es.addEventListener("start", handle("start"));
    es.addEventListener("retrieval", handle("retrieval"));
    es.addEventListener("sources", handle("sources"));
    es.addEventListener("token", handle("token"));
    es.addEventListener("done", handle("done"));
    es.addEventListener("error", (ev: MessageEvent) => {
        try {
            const parsed = JSON.parse(ev.data) as ChatStreamEvent;
            if (onEvent) {
                onEvent({ type: "error", data: parsed.data || {} });
            }
        } catch (e) {
            if (onError) {
                onError(e);
            }
        }
    });

    es.onerror = (e) => {
        if (onError) {
            onError(e);
        }
    };

    return {
        close: () => {
            try { es.close(); } catch { }
        },
        raw: es,
    };
}

export async function postChatReport(params: { referenceId: string; reason: string; source?: string; messageId?: string }) {
    const payload = {
        reference_id: params.referenceId,
        reason: params.reason,
        source: params.source ?? "chat_message",
        ...(params.messageId ? { message_id: params.messageId } : {}),
    };
    const res = await fetch(`${API_BASE}/chat/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Report failed: ${res.status} ${text}`);
    }
    return res.json() as Promise<{ status: string; message?: string; report_id: number }>;
}


