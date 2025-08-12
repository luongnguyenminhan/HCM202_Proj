"""
LLM utilities using LangChain with Google Generative AI.
"""

from __future__ import annotations

from typing import Optional, List, Tuple, AsyncIterator

from app.core.config import GOOGLE_API_KEY, LLM_MODEL_ID

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


def get_chat_model(model: str = LLM_MODEL_ID) -> ChatGoogleGenerativeAI:
    """Return a ChatGoogleGenerativeAI model (requires GOOGLE_API_KEY)."""
    if not GOOGLE_API_KEY:
        raise ValueError('GOOGLE_API_KEY is not set')
    return ChatGoogleGenerativeAI(model=model, api_key=GOOGLE_API_KEY, temperature=0.2)


SYSTEM_PROMPT = 'Bạn là trợ lý RAG tiếng Việt, phong cách nghiêm túc/học thuật về tư tưởng Hồ Chí Minh, chính trị, triết lý.\n- Luôn trả lời bằng tiếng Việt, 3–5 câu, rõ ràng, dễ đọc.\n- Tuyệt đối không bịa, chỉ dùng thông tin từ context. Nếu thiếu dữ liệu, nói rõ là không có thông tin.\n- Luôn kèm trích dẫn ít nhất 1 nguồn nếu có.\n'


def build_prompt(
    question: str,
    context: str,
    citations_text: str = '',
    memory_text: str = '',
) -> ChatPromptTemplate:
    """Build a structured prompt for RAG QA with persona, memory và trích dẫn."""
    # Build prompt using LangChain's recommended input variables
    template = '<system>' + SYSTEM_PROMPT + "</system>\n<context>\n{context}\n</context>\n{memory_section}<question>\n{question}\n</question>\nYêu cầu trả lời:\n- Trả lời 3–5 câu, súc tích, đúng trọng tâm.\n- Thêm mục 'Trích dẫn' ở cuối, theo format: [doc_title] → [chapter] → [page?].\n{citations_section}"

    memory_section = ''
    if memory_text:
        memory_section = f'<memory>\n{memory_text}\n</memory>\n'
    citations_section = ''
    if citations_text:
        citations_section = f'Các nguồn tham khảo có thể dùng:\n{citations_text}\n'

    # Compose the full prompt string
    prompt_str = template.format(
        context=context,
        memory_section=memory_section,
        question=question,
        citations_section=citations_section,
    )
    # Use only variables that are present in the template
    return ChatPromptTemplate.from_template(prompt_str)


async def stream_answer(
    question: str,
    context: str,
    citations_text: str = '',
    memory_text: str = '',
) -> AsyncIterator[str]:
    """Stream từng token câu trả lời từ LLM (LangChain LCEL)."""
    chat = get_chat_model()
    prompt = build_prompt(
        question=question,
        context=context,
        citations_text=citations_text,
        memory_text=memory_text,
    )
    chain = prompt | chat
    async for chunk in chain.astream({}):
        text = getattr(chunk, 'content', None)
        if not text:
            text = str(chunk)
        if text:
            yield text
