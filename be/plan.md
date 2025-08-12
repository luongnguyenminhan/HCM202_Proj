# Backend API Plan (MVP) – Chatbot RAG HCM

- **Base URL**: `/api/v1`
- **Mục tiêu PRD**: RAG trả lời dựa trên tài liệu gốc, trích dẫn rõ ràng (3–5 câu/đoạn), viewer tài liệu song song, OCR + indexing, quản trị corpus, bài viết tĩnh chuyên đề, thống kê, deploy Docker.

## 1) API hiện có (cần hoàn thiện theo PRD)

- **Chat**
  - POST `/chat/query` → Chat RAG (OK: tích hợp Qdrant + LLM Gemini qua LangChain, `RAG_TOP_K` từ env)
  - POST `/chat/report` → Báo cáo nội dung (OK: ghi `reports`)
- **Documents**
  - GET `/docs/list` → Danh sách tài liệu + số chương (OK)
  - GET `/docs/{doc_id}` → Chi tiết tài liệu + chương (OK)
  - POST `/docs/highlight` → BỎ trong MVP (không lưu highlight; dùng offsets từ `/docs/search`, `/docs/chunks`)
  - GET `/docs/search` → Tìm đoạn liên quan semantic (OK)
  - GET `/docs/chunks` → Danh sách chunks theo `chapter_id` + pagination + highlights (OK)
- **Corpus (admin)**
  - POST `/corpus/upload` → Upload + xử lý (OK: parse PDF/DOCX cơ bản, chia chapter naive, chunk, embed, upsert Qdrant, lưu DB; chưa lưu file ra disk)
  - DELETE `/corpus/delete?document_id=` → Xóa (OK: xóa vector theo chunk_ids + xóa DB cascade thủ công; đã có header `X-Admin-Token`)
- **Articles**
  - GET `/articles/list` → Danh sách (OK, có pagination)
  - GET `/articles/{article_id}` → Chi tiết (OK)
  - GET `/articles/categories` → Danh mục (mock)
  - GET `/articles/featured` → Nổi bật (OK)
- **Static/Utils**
  - GET `/special-analysis` → Alias tới bài viết chuyên đề cố định (placeholder; chờ `article_id`)
  - GET `/homepage/featured` → Dẫn tới articles featured (OK)
  - GET `/health` → Health (OK)
  - GET `/stats` → Thống kê: `total_documents`, `total_chunks`, `total_articles`, `total_reports` (không cache)

## 2) API cần bổ sung (đề xuất cho MVP)

- **Documents/Viewer**
  - (ĐÃ CÓ) `/docs/search`, `/docs/chunks` theo yêu cầu MVP
- **Corpus (admin)**
  - GET `/corpus/jobs/{job_id}` → Theo dõi trạng thái xử lý (optional)
  - POST `/corpus/reindex/{document_id}` → Rebuild embeddings (optional)
- **Chat**
  - GET `/chat/suggest` → Gợi ý câu hỏi (optional)
- **Static/Articles**
  - (MVP) Alias `/special-analysis` tới bài viết chuyên đề cố định; FE dùng `/articles/{id}` để hiển thị chi tiết

## 3) Checklist theo module

- **RAGService**
  - [x] Tích hợp Qdrant: ensure collection, search theo `RAG_TOP_K`
  - [x] Embeddings: Google text-embedding-004 (yêu cầu `GOOGLE_API_KEY`)
  - [x] LLM: Google Gemini (LangChain) + prompt tiếng Việt
  - [ ] Trả về trích dẫn 3–5 câu: tách `passage` (hiện dùng snippet `chunk_text`/`Quote`)
  - [x] Bổ sung `page_number?` nếu có `Quote`
  - [x] (BỎ) Logging `chat_queries`; dùng Memory theo phiên `X-Session-Id` (TTL 1h, tối đa 10 turns)

- **CorpusService**
  - [~] OCR/parse: PDF/DOCX cơ bản (chưa OCR scan image), fallback text
  - [x] Phát hiện chapter naive, tạo `Chapter`
  - [x] Chunking theo ký tự (~3000 chars, overlap 500)
  - [x] Embedding + Qdrant upsert (batch)
  - [ ] Lưu file gốc ra disk theo `file_hash` (mới set `file_path`, chưa ghi ra disk)
  - [x] Xóa: thu thập chunk_ids → xóa Qdrant → xóa DB (cascade thủ công)
  - [x] Validate: MIME whitelist, size ≤ 10MB
  - [x] Admin auth: `X-Admin-Token`
  - [x] Hỗ trợ TXT; MIME whitelist: PDF/DOCX/TXT; hard-limit 10MB (mã lỗi 413)
  - [x] Overwrite theo `title` (từ tên file): xóa vectors + DB cũ, reindex lại

- **Documents**
  - [x] Bỏ bảng `highlights`; không lưu highlight. Offset trả về từ `/docs/search`, `/docs/chunks`
  - [x] Thêm GET `/docs/chunks` (theo `chapter_id` + pagination; optional `q` để trả highlights)
  - [x] Thêm GET `/docs/search` (semantic: Qdrant; trả `snippet`, `score`, `doc/chapter/page`, `chunk_id`, `offsets`)

- **Articles/Static**
  - [ ] Seed 1 bài viết chuyên đề, dùng `/articles/{id}` cho trang chuyên đề (alias `/special-analysis` chờ `article_id`)
  - [ ] `categories`: giữ mock cho MVP, tách bảng `categories` (backlog)
  - [~] `/special-analysis`: alias placeholder (đang trả nội dung tạm)

- **Stats/Observability**
  - [x] `/stats` trả số liệu: `total_documents`, `total_chunks`, `total_articles`, `total_reports`
  - [ ] Logging có request-id, thời gian xử lý; cấu hình mức log

## 4) Data models & Migration

- **Mới**
  - (BỎ) `ChatQuery` (không dùng logging)
  - (BỎ) `Highlight` (không lưu highlight)
- **Sửa**
  - (Backlog) `Document.cover_image` nếu cần hiển thị ảnh bìa
  - (Optional) `Post` + `Category` + `post_categories` (sau MVP)

## 5) SLA/Hiệu năng (MVP)

- [ ] Thời gian trả lời phổ biến < 3s (PRD)
- [ ] TopK=5, batch embedding, connection pooling MySQL, async I/O
- [ ] Cache tạm câu hỏi phổ biến (optional)

## 6) Bảo mật

- [ ] CORS đúng domain FE khi lên staging/prod
- [ ] Admin token cho `/corpus/*`
- [ ] Giới hạn kích thước upload (đã có 10MB), MIME whitelist
- [ ] Rate limit nhẹ cho `/chat/query` (reverse proxy)

## 7) Kiểm thử

- [ ] Unit test: services (`rag`, `corpus`, `document`, `article`)
- [ ] Integration: upload → index → chat → trích dẫn đúng doc/chapter
- [ ] E2E seed 20+ tài liệu mẫu; script kiểm tra ngẫu nhiên 20 câu hỏi

## 8) Lộ trình 3 ngày (theo PRD)

- **Day 1**
  - [x] Parsing cơ bản + chunking + embedding + Qdrant upsert (pipeline tối thiểu)
  - [x] Hook `/corpus/upload`, `/corpus/delete`
  - [x] `rag._search_vectors` dùng Qdrant thật; `_generate_answer` kết nối Gemini
  - [ ] Seed 3–5 tài liệu mẫu; query POC có nguồn trích dẫn

- **Day 2**
  - [ ] `/docs/chunks`, `/docs/search`; hoàn thiện `/docs/highlight`
  - [x] Admin auth cho corpus; `/stats` tạm dùng proxy `reports`
  - [ ] Bài viết chuyên đề: seed 1 bài, dùng `/articles/{id}` cho FE

- **Day 3**
  - [ ] Tối ưu tốc độ (index params, prompt, batch size)
  - [ ] Hoàn thiện trích dẫn 3–5 câu, kèm `page_number` nếu có
  - [ ] Kiểm thử toàn bộ + Docker Compose staging

## 9) Acceptance (API)

- [ ] Chat trả lời từ 20+ tài liệu, có trích dẫn rõ (doc/chapter + 3–5 câu)
- [ ] Viewer hiển thị song song; có endpoint lấy trích đoạn
- [ ] Trang tóm tắt tài liệu/chương dùng `/docs/*`
- [ ] Trang chuyên đề dùng `/articles/{id}`
- [ ] Nút báo cáo hoạt động → có bản ghi `reports`
- [ ] `/health`, `/stats` chạy OK; deploy staging stable
