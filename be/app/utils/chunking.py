"""
Tiện ích tách/chia nhỏ tài liệu.
PDF/DOCX → text thô → chương (naive) → chunks (~600 tokens, naive theo ký tự).
@color.py
"""

from __future__ import annotations

from typing import List, Tuple

import re

# Thêm import từ color.py để debug/log
from app.utils.color import print_debug, print_error

try:
    from pypdf import PdfReader
except Exception:  # pragma: no cover
    PdfReader = None

try:
    import docx  # python-docx
except Exception:  # pragma: no cover
    docx = None


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if PdfReader is None:
        print_error("pypdf chưa cài đặt")
        raise RuntimeError("pypdf not installed")
    from io import BytesIO

    reader = PdfReader(BytesIO(file_bytes))
    pages: List[str] = []
    for p in reader.pages:
        try:
            pages.append(p.extract_text() or "")
        except Exception:
            print_error("Lỗi extract_text trang PDF")
            pages.append("")
    print_debug(f"Đã tách {len(pages)} trang PDF")
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
