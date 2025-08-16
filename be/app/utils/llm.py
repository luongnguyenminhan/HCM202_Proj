"""
LLM utilities using LangChain with Google Generative AI.
"""

from __future__ import annotations

from typing import Optional, List, Tuple, AsyncIterator, Literal

from app.core.config import (
    GOOGLE_API_KEY,
    LLM_MODEL_ID,
    UNSTRUCTURED_API_KEY,
    UNSTRUCTURED_API_URL,
)

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate

# Optional imports guarded to avoid hard failure if not installed yet
try:  # PyMuPDF4LLM for local PDF parsing
    import pymupdf4llm  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    pymupdf4llm = None  # type: ignore

try:  # LangChain Unstructured loader (API mode)
    from langchain_unstructured import UnstructuredLoader  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    UnstructuredLoader = None  # type: ignore

try:  # Unstructured API client
    from unstructured_client import UnstructuredClient  # type: ignore
except Exception:  # pragma: no cover - optional at runtime
    UnstructuredClient = None  # type: ignore


def get_chat_model(model: str = LLM_MODEL_ID) -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI model (requires GOOGLE_API_KEY)."""
    if not GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not set")
    # Cho phép cấu hình bỏ kiểm tra SSL qua biến môi trường (tùy chọn)
    # Chỉ kích hoạt khi DEV_DISABLE_SSL_VERIFY=true để tránh ảnh hưởng production
    import os

    if os.getenv("DEV_DISABLE_SSL_VERIFY", "false").lower() in {"1", "true", "yes"}:
        os.environ.setdefault("CURL_CA_BUNDLE", "")
        os.environ.setdefault("REQUESTS_CA_BUNDLE", "")
        os.environ.setdefault("PYTHONHTTPSVERIFY", "0")

    try:
        # Thiết lập timeout và retry an toàn hơn
        return ChatGoogleGenerativeAI(
            model=model,
            api_key=GOOGLE_API_KEY,
            temperature=0.2,
            timeout=30,
            max_retries=3,
        )
    except Exception:
        # Fallback an toàn tối thiểu nếu tham số không được hỗ trợ
        return ChatGoogleGenerativeAI(
            model=model, api_key=GOOGLE_API_KEY, temperature=0.2
        )


SYSTEM_PROMPT = 'Bạn là trợ lý RAG tiếng Việt, phong cách nghiêm túc/học thuật về tư tưởng Hồ Chí Minh, chính trị, triết lý; đồng thời linh hoạt trò chuyện (chit-chat) thân thiện khi người dùng chào hỏi/xã giao.\n- Luôn trả lời bằng tiếng Việt, 3–5 câu, rõ ràng, dễ đọc.\n- Với câu hỏi yêu cầu thông tin: tuyệt đối không bịa; chỉ dùng thông tin từ context. Nếu thiếu dữ liệu, nói rõ là không có thông tin.\n- Với chit-chat/không cần tri thức: trả lời tự nhiên, ngắn gọn; không cần dựa vào context.\n- Không yêu cầu trình bày phần "Trích dẫn" trong câu trả lời.\n'


def build_prompt(
    question: str,
    context: str,
    citations_text: str = "",
    memory_text: str = "",
) -> str:
    """Xây dựng prompt hoàn chỉnh (string) để tránh lỗi parse biến do ký tự `{}` trong context.

    Trả về chuỗi đã chèn sẵn persona, context, memory, citations.
    """
    memory_section = ""
    if memory_text:
        memory_section = f"<memory>\n{memory_text}\n</memory>\n"
    citations_section = ""
    if citations_text:
        citations_section = f"Các nguồn tham khảo có thể dùng:\n{citations_text}\n"

    prompt_str = (
        "<system>"
        + SYSTEM_PROMPT
        + "</system>\n"
        + "<context>\n"
        + context
        + "\n</context>\n"
        + memory_section
        + "<question>\n"
        + question
        + "\n</question>\n"
        + "Yêu cầu trả lời:\n- Trả lời 3–5 câu, súc tích, đúng trọng tâm; có thể dùng gạch đầu dòng khi phù hợp.\n- Nếu là chit-chat: thân thiện, ngắn gọn; không cần trích dẫn.\n"
        + citations_section
    )
    return prompt_str


async def stream_answer(
    question: str,
    context: str,
    citations_text: str = "",
    memory_text: str = "",
) -> AsyncIterator[str]:
    """Stream từng token câu trả lời từ LLM (LangChain LCEL)."""
    chat = get_chat_model()
    prompt_text = build_prompt(
        question=question,
        context=context,
        citations_text=citations_text,
        memory_text=memory_text,
    )
    async for chunk in chat.astream(prompt_text):
        text = getattr(chunk, "content", None)
        if not text:
            text = str(chunk)
        if text:
            yield text


# =====================
# PDF Loading Utilities
# =====================


def load_pdf_text(
    file_path: str,
    strategy: Literal["pymupdf", "unstructured", "auto"] = "auto",
    max_characters: int = 1_000_000,
) -> str:
    """Load nội dung PDF thành text.

    - "pymupdf": dùng PyMuPDF4LLM (nhanh, local)
    - "unstructured": dùng UnstructuredLoader qua API (cần UNSTRUCTURED_API_KEY)
    - "auto": ưu tiên PyMuPDF, fallback Unstructured nếu có API Key
    """
    if strategy == "pymupdf" or (strategy == "auto"):
        if pymupdf4llm is not None:
            # to_markdown trả về Markdown giữ cấu trúc; vẫn dùng làm text input cho RAG
            return pymupdf4llm.to_markdown(file_path)
        if strategy == "pymupdf":
            raise ImportError("pymupdf4llm chưa được cài đặt")

    # Unstructured branch
    if strategy in ("unstructured", "auto"):
        if UnstructuredLoader is None:
            if strategy == "unstructured":
                raise ImportError("langchain-unstructured chưa được cài đặt")
            # when auto: continue to final error below
        else:
            if not UNSTRUCTURED_API_KEY:
                raise ValueError(
                    "UNSTRUCTURED_API_KEY chưa được thiết lập cho chế độ unstructured"
                )
            if UnstructuredClient is None:
                raise ImportError("unstructured-client chưa được cài đặt")

            client = UnstructuredClient(
                api_key_auth=UNSTRUCTURED_API_KEY,
                server_url=UNSTRUCTURED_API_URL,
            )
            loader = UnstructuredLoader(
                file_path,
                partition_via_api=True,
                client=client,
                # Reproduce mode="single": one big doc
                chunking_strategy="basic",
                max_characters=max_characters,
                include_orig_elements=False,
            )
            docs = loader.load()
            if not docs:
                return ""
            # Gộp thành 1 text
            return "\n\n".join(d.page_content for d in docs)

    raise RuntimeError("Không thể load PDF: không có backend khả dụng")
