# API Docs (Cập nhật sau mỗi flow)

## Thông tin chung

- **Base URL**: `/api/v1`
- **Stack**: FastAPI, SQLModel, Pydantic, SQLAlchemy ORM
- **Auth (admin)**: Header `X-Admin-Token` cho nhóm `/corpus/*` (so khớp với `ADMIN_TOKEN` trong config)
- **LLM/Embeddings**: Google Generative AI (`GOOGLE_API_KEY` bắt buộc), Qdrant cho vector search

## Mẫu ghi nhanh cho mỗi endpoint

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

## Structured output (RAG)

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

## Theo plan

- Sau khi hoàn tất flow, bổ sung/điều chỉnh theo `be/plan.md`.

## Chat

- **POST `/chat/query`**
  - **Mục đích**: Hỏi đáp RAG, trả lời ngắn gọn kèm trích dẫn.
  - **Request**: `schemas.ChatQuery`
    - `question: string` (1–1000 ký tự)
    - `include_debug?: boolean` (mặc định `false`)
    - Header tuỳ chọn: `X-Session-Id` (ghi nhớ hội thoại, TTL 1h, tối đa 10 lượt)
  - **Response**: `schemas.ChatResponse`
  - **Ghi chú**:
    - Persona: nghiêm túc/học thuật, HCM tư tưởng/chính trị/triết lý; luôn tiếng Việt, không bịa, có fallback khi thiếu nguồn.
    - Dùng embeddings + Qdrant để tìm `chunks`, sau đó LLM tổng hợp; `num_citations` ≤ `RAG_TOP_K` (mặc định 5, tối đa 10).
   - **Ví dụ (fetch)**:

     ```javascript
     fetch('http://localhost:8000/api/v1/chat/query', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json', 'X-Session-Id': 'demo-session' },
       body: JSON.stringify({ question: 'Tư tưởng HCM về giáo dục?', include_debug: true })
     }).then(r => r.json()).then(console.log)
     ```
## Documents

 - **GET `/docs/search`**
   - **Mục đích**: Tìm kiếm semantic trong tài liệu; trả về snippet, score, doc/chapter/page, kèm offsets để highlight.
   - **Query**: `q: string`, `doc_id?: number`, `chapter_id?: number`, `page?: number=1`, `limit?: number=10 (≤50)`
   - **Response**: `schemas.ChunkSearchResponse`
  - **Ví dụ (fetch)**:

    ```javascript
    fetch('http://localhost:8000/api/v1/docs/search?q=tu tuong&limit=5')
      .then(r => r.json()).then(console.log)
    ```

 - **GET `/docs/chunks`**
   - **Mục đích**: Lấy danh sách chunks theo `chapter_id` có phân trang; nếu có `q` sẽ trả offsets highlight cho từng chunk.
   - **Query**: `chapter_id: number`, `page?: number=1`, `limit?: number=20 (≤100)`, `q?: string`
   - **Response**: `schemas.ChapterChunksResponse`
  - **Ví dụ (fetch)**:

    ```javascript
    fetch('http://localhost:8000/api/v1/docs/chunks?chapter_id=1&page=1&limit=20&q=độc lập')
      .then(r => r.json()).then(console.log)
    ```


- **POST `/chat/report`**
  - **Mục đích**: Báo cáo câu trả lời sai/không phù hợp.
  - **Request**: `schemas.ChatReportRequest`
    - `reference_id: string`
    - `reason: string (≤ 500)`
    - `message_id?: string`
    - `source?: string` (mặc định `chat_message`)
  - **Response**: `schemas.ChatReportResponse` (`report_id`)
  - **Ví dụ (fetch)**:

    ```javascript
    fetch('http://localhost:8000/api/v1/chat/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference_id: 'msg_123', reason: 'Sai trích dẫn' })
    }).then(r => r.json()).then(console.log)
    ```

## Corpus (admin)

- **POST `/corpus/upload`**
  - **Mục đích**: Upload tài liệu → OCR/parse → phát hiện chương → chunk → embed → upsert Qdrant → lưu DB.
  - **Request**: `multipart/form-data`
    - `file: UploadFile` (PDF/DOCX; MIME: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; ≤ 10MB)
    - `title: string`
    - `description?: string`
    - `source?: string`
    - Header `X-Admin-Token` (nếu cấu hình `ADMIN_TOKEN`)
  - **Response**: `schemas.CorpusUploadResponse`
    - `status: 'ok'`, `document_id`, `chapter_count`, `chunk_count`
  - **Ghi chú**:
    - Hiện tại trường `file_path` được set theo hash nhưng chưa lưu file thật ra disk.
  - **Ví dụ (fetch)**:

    ```javascript
    const fd = new FormData();
    fd.append('file', myFile); // File từ input
    fd.append('title', 'Tài liệu HCM');
    fd.append('description', 'Mô tả ngắn');
    fd.append('source', 'Nguồn A');
    fetch('http://localhost:8000/api/v1/corpus/upload', {
      method: 'POST',
      headers: { 'X-Admin-Token': '...ADMIN_TOKEN...' },
      body: fd
    }).then(r => r.json()).then(console.log)
    ```

- **DELETE `/corpus/delete`**
  - **Mục đích**: Xóa tài liệu và toàn bộ dữ liệu liên quan (Qdrant + DB cascade thủ công).
  - **Query**: `document_id: number`
  - **Headers**: `X-Admin-Token`
  - **Response**: `schemas.CorpusDeleteResponse` (`deleted_document_id`)
  - **Ví dụ (fetch)**:

    ```javascript
    fetch('http://localhost:8000/api/v1/corpus/delete?document_id=123', {
      method: 'DELETE',
      headers: { 'X-Admin-Token': '...ADMIN_TOKEN...' }
    }).then(r => r.json()).then(console.log)
    ```

## Error format

- **ErrorResponse**: `status: 'error'`, `message: string`, `details?: object`
- **Common HTTP codes**: `400` (input), `401` (unauthorized), `404` (not found), `500` (internal)
