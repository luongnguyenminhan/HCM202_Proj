# Test API (Node.js)

- Yêu cầu: Node >= 18 (có `fetch`, `FormData`, `Blob` builtin)
- Chạy server BE ở `http://localhost:8000`

## Cách chạy

```bash
node be/tests/test_api.mjs
```

- Script sẽ:
  - Kiểm tra `/health`, `/stats`
  - Upload một tài liệu nhỏ, sau đó gọi `/docs/*`
  - Gọi `/articles/*`, `/homepage/featured`, `/special-analysis`
  - Gọi `/chat/query`, `/chat/stream`, `/chat/report`
  - Xóa tài liệu vừa upload

## Ghi chú
- Các API AI chỉ kiểm tra HTTP 200 (không assert nội dung). 
- `X-Admin-Token` dùng giá trị mặc định từ config: `11minhan`.
