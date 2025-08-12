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
  { "question": "...", "top_k": 5 }
  ```

### Theo plan
- Sau khi hoàn tất flow, bổ sung/điều chỉnh theo `be/plan.md`.
