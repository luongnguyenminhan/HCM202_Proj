## Backend API Plan (MVP) – Chatbot RAG HCM

- **Base URL**: `/api/v1`
- **Mục tiêu PRD**: RAG trả lời dựa trên tài liệu gốc, trích dẫn rõ ràng (3–5 câu/đoạn), viewer tài liệu song song, OCR + indexing, quản trị corpus, bài viết tĩnh chuyên đề, thống kê, deploy Docker.

### 1) API hiện có (cần hoàn thiện theo PRD)
- **Chat**
  - POST `/chat/query` → Chat RAG (hiện mock LLM + search)
  - POST `/chat/report` → Báo cáo nội dung (OK)
- **Documents**
  - GET `/docs/list` → Danh sách tài liệu + số chương (OK)
  - GET `/docs/{doc_id}` → Chi tiết tài liệu + chương (OK)
  - POST `/docs/highlight` → Lưu highlight (stub, thiếu bảng `highlights`)
- **Corpus (admin)**
  - POST `/corpus/upload` → Upload + xử lý (stub OCR + chunk + embed + index)
  - DELETE `/corpus/delete?document_id=` → Xóa (stub xóa vector Qdrant + thiếu auth)
- **Articles**
  - GET `/articles/list` → Danh sách (OK, có pagination)
  - GET `/articles/{article_id}` → Chi tiết (OK)
  - GET `/articles/categories` → Danh mục (mock)
  - GET `/articles/featured` → Nổi bật (OK)
- **Static/Utils**
  - GET `/special-analysis` → Nội dung chuyên đề (mock)
  - GET `/homepage/featured` → Dẫn tới articles featured (OK)
  - GET `/health` → Health (OK)
  - GET `/stats` → Thống kê (dùng `reports` làm proxy, thiếu `chat_queries`)

### 2) API cần bổ sung (đề xuất cho MVP)
- **Documents/Viewer**
  - GET `/docs/chunks?ids=1,2,3` → Trả về `chunk_text` + metadata (phục vụ viewer trích đoạn)
  - GET `/docs/search?q=&doc_id?=&chapter_id?=&limit?=` → Tìm đoạn liên quan (snippets)
- **Corpus (admin)**
  - GET `/corpus/jobs/{job_id}` → Theo dõi trạng thái xử lý (optional)
  - POST `/corpus/reindex/{document_id}` → Rebuild embeddings (optional)
- **Chat**
  - GET `/chat/suggest` → Gợi ý câu hỏi (optional)
- **Static/Articles**
  - (MVP) Dùng luôn `/articles/{id}` cho bài viết chuyên đề thay cho mock `/special-analysis`

### 3) Checklist theo module
- **RAGService**
  - [ ] Tích hợp Qdrant: tạo collection, upsert/search (topK, filter theo `document_id` khi cần)
  - [ ] Embeddings: chọn provider (OpenAI/SBERT/Local) + chuẩn hóa chiều vector
  - [ ] LLM: chọn provider (OpenAI/Claude/Local) + prompt buộc trích dẫn, tránh kiến thức ngoài
  - [ ] Trả về trích dẫn 3–5 câu: trích xuất `passage` từ `chunk_text` (ưu tiên `Quote` nếu có)
  - [ ] Bổ sung schema `ChatSource`: `passage`, `page_number?` (từ `Quote.page_number`)
  - [ ] Ghi log truy vấn vào bảng `chat_queries` (thời gian, topK, doc_ids)

- **CorpusService**
  - [ ] OCR: PDF/DOCX → text; scan → Tesseract; unify pipeline
  - [ ] Phát hiện chapter: header/regex/TOC; fallback thủ công; tạo `Chapter`
  - [ ] Chunking: kích thước ~600 tokens, overlap ~100; lưu `Chunk`
  - [ ] Embedding + Qdrant upsert (batch, song song)
  - [ ] Lưu file gốc: `file_path`, checksum; storage local volume
  - [ ] Xóa: thu thập `qdrant_point_id` → xóa Qdrant → xóa MySQL (cascade); retry-safe
  - [ ] Validate: loại file, kích thước, (optional) virus scan
  - [ ] Admin auth: header `X-Admin-Token` cho `/corpus/*`

- **Documents**
  - [ ] Thêm bảng `highlights` + triển khai POST `/docs/highlight`
  - [ ] Thêm GET `/docs/chunks` (fetch theo danh sách id)
  - [ ] Thêm GET `/docs/search` (full-text/like; tối ưu sau)

- **Articles/Static**
  - [ ] Seed 1 bài viết chuyên đề, dùng `/articles/{id}` cho trang chuyên đề
  - [ ] `categories`: giữ mock cho MVP, tách bảng `categories` (backlog)
  - [ ] `/special-analysis`: chuyển thành alias tới bài viết chuyên đề

- **Stats/Observability**
  - [ ] Bảng `chat_queries`; cập nhật `/stats` dùng số liệu thật
  - [ ] Logging có request-id, thời gian xử lý; cấu hình mức log

### 4) Data models & Migration
- **Mới**
  - `ChatQuery` (table): `id`, `question`, `answer_tokens?`, `latency_ms`, `top_k`, `document_ids(json)`, `created_at`
  - `Highlight` (table): `id`, `document_id`, `chapter_id?`, `text`, `start_position?`, `end_position?`, `created_at`
- **Sửa**
  - (Backlog) `Document.cover_image` nếu cần hiển thị ảnh bìa
  - (Optional) `Post` + `Category` + `post_categories` (sau MVP)

### 5) SLA/Hiệu năng (MVP)
- [ ] Thời gian trả lời phổ biến < 3s (PRD)
- [ ] TopK=5, batch embedding, connection pooling MySQL, async I/O
- [ ] Cache tạm câu hỏi phổ biến (optional)

### 6) Bảo mật
- [ ] CORS đúng domain FE khi lên staging/prod
- [ ] Admin token cho `/corpus/*`
- [ ] Giới hạn kích thước upload (đã có 10MB), MIME whitelist
- [ ] Rate limit nhẹ cho `/chat/query` (reverse proxy)

### 7) Kiểm thử
- [ ] Unit test: services (`rag`, `corpus`, `document`, `article`)
- [ ] Integration: upload → index → chat → trích dẫn đúng doc/chapter
- [ ] E2E seed 20+ tài liệu mẫu; script kiểm tra ngẫu nhiên 20 câu hỏi

### 8) Lộ trình 3 ngày (theo PRD)
- **Day 1**
  - [ ] OCR + parsing + chunking + embedding + Qdrant upsert (pipeline tối thiểu)
  - [ ] Hook vào `/corpus/upload`, `/corpus/delete`
  - [ ] `rag._search_vectors` → Qdrant search thật; `rag._generate_answer` kết nối LLM
  - [ ] Seed 3–5 tài liệu mẫu; query POC có nguồn trích dẫn

- **Day 2**
  - [ ] `/docs/chunks`, `/docs/search`; hoàn thiện `/docs/highlight`
  - [ ] Admin auth cho corpus; `/stats` dùng `chat_queries`
  - [ ] Bài viết chuyên đề: seed 1 bài, dùng `/articles/{id}` cho FE

- **Day 3**
  - [ ] Tối ưu tốc độ (index params, prompt, batch size)
  - [ ] Hoàn thiện trích dẫn 3–5 câu, kèm `page_number` nếu có
  - [ ] Kiểm thử toàn bộ + Docker Compose staging

### 9) Acceptance (API)
- [ ] Chat trả lời từ 20+ tài liệu, có trích dẫn rõ (doc/chapter + 3–5 câu)
- [ ] Viewer hiển thị song song; có endpoint lấy trích đoạn
- [ ] Trang tóm tắt tài liệu/chương dùng `/docs/*`
- [ ] Trang chuyên đề dùng `/articles/{id}`
- [ ] Nút báo cáo hoạt động → có bản ghi `reports`
- [ ] `/health`, `/stats` chạy OK; deploy staging stable


