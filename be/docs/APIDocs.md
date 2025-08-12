## API Docs (Cập nhật sau mỗi flow)

### Thông tin chung
- **Base URL**: `/api/v1`
- **Stack**: FastAPI, SQLModel, Pydantic, SQLAlchemy ORM

### Mẫu ghi nhanh cho mỗi endpoint
- **Method/Path**: `POST /chat/query`
- **Mục đích**: Tóm tắt 1–2 câu
- **Request Schema**: `schemas/...`
- **Response Schema**: `schemas/...`
- **Ghi chú**: điều kiện, side-effects, service liên quan
- **Ví dụ**:
  ```json
  { "question": "...", "include_debug": false }
  ```
  - **Notes**: truy vấn toàn bộ corpus (không filter doc/chapter), `top_k` mặc định lấy từ env `RAG_TOP_K`.

### Structured output (RAG)
- **ChatResponse**:
  - `answer: string`
  - `num_citations: number`
  - `sources: Array<ChatSource>`
  - `debug?: { retrieved_chunks: number[], query_time_ms?: number, vector_search_time_ms?: number }`
- **ChatSource**:
  - `document_id: number`
  - `chapter_id: number`
  - `chunk_id: number`
  - `page_number?: number`
  - `text: string`
  - `score?: number`
  - `url?: string`

### Theo plan
- Sau khi hoàn tất flow, bổ sung/điều chỉnh theo `be/plan.md`.
