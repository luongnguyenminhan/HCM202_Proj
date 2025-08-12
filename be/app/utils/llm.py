"""
LLM utilities using LangChain with Google Generative AI.
"""

from __future__ import annotations

from typing import Optional, List, Tuple

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
    template = '<system>' + SYSTEM_PROMPT + '</system>\n<context>\n{context}\n</context>\n{memory_section}<question>\n{question}\n</question>\nYêu cầu trả lời:\n- Trả lời 3–5 câu, súc tích, đúng trọng tâm.\n- Thêm mục "Trích dẫn" ở cuối, theo format: [doc_title] → [chapter] → [page?].\n{citations_section}'

    memory_section = ''
    if memory_text:
        memory_section = '<memory>\n' + memory_text + '\n</memory>\n'
    citations_section = ''
    if citations_text:
        citations_section = 'Các nguồn tham khảo có thể dùng:\n' + citations_text + '\n'

    templ = template.format(memory_section=memory_section, citations_section=citations_section)
    return ChatPromptTemplate.from_template(templ).partial(context=context, question=question)
