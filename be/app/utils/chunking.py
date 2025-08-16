"""
Tiện ích tách/chia nhỏ tài liệu.
PDF/DOCX → text thô → chương (naive) → chunks (~600 tokens, naive theo ký tự).
@color.py
"""

from __future__ import annotations

from typing import List, Tuple

import re
import os

# Thêm import từ color.py để debug/log
from app.utils.color import print_debug, print_error

# Tuỳ chọn: vô hiệu hoá verify SSL trong môi trường DEV để tránh lỗi SSL khi
# các thư viện phụ trợ thực hiện kết nối mạng nội bộ (nếu có).
if os.getenv("DEV_DISABLE_SSL_VERIFY", "false").lower() in {"1", "true", "yes"}:
    os.environ.setdefault("CURL_CA_BUNDLE", "")
    os.environ.setdefault("REQUESTS_CA_BUNDLE", "")
    os.environ.setdefault("PYTHONHTTPSVERIFY", "0")

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover
    PdfReader = None

# Ưu tiên PyMuPDF4LLM nếu có (chất lượng trích xuất tốt hơn)
try:
    import fitz  # type: ignore  # PyMuPDF
except Exception:  # pragma: no cover
    fitz = None  # type: ignore

try:
    import pymupdf4llm  # type: ignore
except Exception:  # pragma: no cover
    pymupdf4llm = None  # type: ignore

try:
    import docx  # python-docx
except Exception:  # pragma: no cover
    docx = None


def extract_text_from_pdf(file_bytes: bytes) -> str:
    # Thử PyMuPDF4LLM trước (nếu có)
    if pymupdf4llm is not None and fitz is not None:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            md_text = pymupdf4llm.to_markdown(doc)
            try:
                page_count = (
                    getattr(doc, "page_count", None)
                    or getattr(doc, "pageCount", None)
                    or 0
                )
                print_debug(f"Đã tách PDF bằng PyMuPDF4LLM: {page_count} trang")
            except Exception:
                pass
            return md_text
        except Exception:
            print_error("Lỗi PyMuPDF4LLM, fallback sang pypdf")

    # Fallback: pypdf
    if PdfReader is None:
        print_error("pypdf chưa cài đặt")
        raise RuntimeError("pypdf not installed")
    from io import BytesIO

    reader = PdfReader(BytesIO(file_bytes))
    pages: List[str] = []
    for p in reader.pages:
        try:
            pages.append(
                p.extract_text().replace("\n\n", "\n").replace("\n \n", "\n ") or ""
            )
        except Exception:
            print_error("Lỗi extract_text trang PDF")
            pages.append("")
    print_debug(f"Đã tách {len(pages)} trang PDF (pypdf)")
    return "\n\n".join(pages)


def extract_text_from_docx(file_bytes: bytes) -> str:
    if docx is None:
        print_error("python-docx chưa cài đặt")
        raise RuntimeError("python-docx not installed")
    from io import BytesIO

    doc = docx.Document(BytesIO(file_bytes))
    paras = [p.text for p in doc.paragraphs]
    print_debug(f"Đã tách {len(paras)} đoạn DOCX")
    return "\n".join(paras)


def naive_split_chapters(text: str) -> List[Tuple[str, str]]:
    """Tách (tiêu đề, nội dung) bằng regex đơn giản trên dòng heading."""
    lines = text.splitlines()
    chapters: List[Tuple[str, str]] = []
    buf: List[str] = []
    current_title = "Mở đầu"
    pattern = re.compile(r"^(Chương\s+\d+\b.*|Chapter\s+\d+\b.*)$", re.I)
    for line in lines:
        if pattern.match(line.strip()):
            if buf:
                chapters.append((current_title, "\n".join(buf).strip()))
                buf = []
            current_title = line.strip()
        else:
            buf.append(line)
    if buf:
        chapters.append((current_title, "\n".join(buf).strip()))
    if not chapters:
        chapters.append(("Nội dung", text))
    print_debug(f"Tách {len(chapters)} chương")
    return chapters


def chunk_by_chars(text: str, max_chars: int = 3000, overlap: int = 500) -> List[str]:
    """Chia nhỏ theo ký tự, có overlap."""
    chunks: List[str] = []
    n = len(text)
    start = 0
    while start < n:
        end = min(n, start + max_chars)
        chunks.append(text[start:end])
        if end == n:
            break
        start = max(0, end - overlap)
    result = [c.strip() for c in chunks if c.strip()]
    print_debug(f"Chia thành {len(result)} chunk")
    return result
