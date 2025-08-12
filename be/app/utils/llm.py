"""
LLM utilities using LangChain with Google Generative AI.
"""

from __future__ import annotations

from typing import Optional

from app.core.config import GOOGLE_API_KEY

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate


def get_chat_model(model: str = 'gemini-1.5-flash') -> ChatGoogleGenerativeAI:
	"""Return a ChatGoogleGenerativeAI model (requires GOOGLE_API_KEY)."""
	if not GOOGLE_API_KEY:
		raise ValueError('GOOGLE_API_KEY is not set')
	return ChatGoogleGenerativeAI(model=model, api_key=GOOGLE_API_KEY, temperature=0.2)


SYSTEM_PROMPT = 'Bạn là trợ lý RAG tiếng Việt. Trả lời ngắn gọn, chính xác, dựa trên ngữ cảnh.\n- Chỉ dùng thông tin từ context, tránh suy đoán.\n- Trích dẫn 3–5 câu/đoạn có liên quan.\n'


def build_prompt(question: str, context: str) -> ChatPromptTemplate:
	"""Build a structured prompt for RAG QA."""
	template = '<system>' + SYSTEM_PROMPT + '</system>\n<context>\n{context}\n</context>\n<question>\n{question}\n</question>\nHãy trả lời bằng tiếng Việt, 3–6 câu, rõ ràng.'
	return ChatPromptTemplate.from_template(template).partial(context=context, question=question)
