// ESM test script for API endpoints using node >=18 (fetch is built-in)
// Run: node be/tests/test_api.mjs

const BASE = 'http://api.hcm202.wc504.io.vn/api/v1';

function assertOk(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testHealth() {
  const res = await fetch(`${BASE}/health`);
  assertOk(res.ok, 'health not ok');
  const json = await res.json();
  console.log('health:', json);
}

async function testStats() {
  const res = await fetch(`${BASE}/stats`);
  assertOk(res.ok, 'stats not ok');
  const json = await res.json();
  console.log('stats:', json);
}

async function testCorpusUpload() {
  const fd = new FormData();
  // Build a Blob from local text file content via fetch 'file://' is not supported; embed small sample here
  const content = `Tiêu đề: Tư tưởng Hồ Chí Minh về giáo dục\n\nGiáo dục là nền tảng của sự phát triển xã hội. Hồ Chí Minh coi trọng việc giáo dục con người toàn diện: đức, trí, thể, mỹ. Học đi đôi với hành, lý luận gắn với thực tiễn. Đạo đức cách mạng là cốt lõi: cần, kiệm, liêm, chính, chí công vô tư. Văn hóa dân tộc là gốc, tiếp thu tinh hoa nhân loại, chống bệnh hình thức. Thanh niên là rường cột nước nhà, phải rèn luyện, cống hiến.\n\nChương 1: Giáo dục và con người (tr. 12)\nHọc để làm người, làm việc, làm cán bộ; học suốt đời. Trường học gắn với xã hội. \n\nChương 2: Đạo đức cách mạng (tr. 34)\nCần, kiệm, liêm, chính; chống chủ nghĩa cá nhân.`;
  const file = new Blob([content], { type: 'text/plain' });
  fd.append('file', file, 'sample.txt');
  fd.append('title', 'Tài liệu Test ' + Date.now());
  fd.append('description', 'Mô tả test');
  fd.append('source', 'test');

  const res = await fetch(`${BASE}/corpus/upload`, {
    method: 'POST',
    headers: { 'X-Admin-Token': '11minhan' },
    body: fd,
  });
  assertOk(res.ok, 'upload not ok');
  const json = await res.json();
  console.log('upload:', json);
  return json.document_id;
}

async function testCorpusDelete(documentId) {
  const res = await fetch(`${BASE}/corpus/delete?document_id=${documentId}`, {
    method: 'DELETE',
    headers: { 'X-Admin-Token': '11minhan' },
  });
  assertOk(res.ok, 'delete not ok');
  const json = await res.json();
  console.log('delete:', json);
}

async function testDocsList() {
  const res = await fetch(`${BASE}/docs/list`);
  assertOk(res.ok, 'docs list not ok');
  const json = await res.json();
  console.log('docs list:', json);
  return json.documents?.[0]?.id;
}

async function testDocsDetail(docId) {
  const res = await fetch(`${BASE}/docs/${docId}`);
  assertOk(res.ok, 'docs detail not ok');
  const json = await res.json();
  console.log('docs detail:', json);
  return json;
}

async function testDocsSearch() {
  const res = await fetch(`${BASE}/docs/search?q=gi%C3%A1o%20d%E1%BB%A5c&limit=5`);
  assertOk(res.ok, 'docs search not ok');
  const json = await res.json();
  console.log('docs search:', json.items?.length);
}

async function testDocsChunks(chapterId) {
  const url = new URL(`${BASE}/docs/chunks`);
  url.searchParams.set('chapter_id', String(chapterId));
  url.searchParams.set('page', '1');
  url.searchParams.set('limit', '5');
  const res = await fetch(url);
  assertOk(res.ok, 'docs chunks not ok');
  const json = await res.json();
  console.log('docs chunks:', json.items?.length);
}

async function testArticlesList() {
  const res = await fetch(`${BASE}/articles/list`);
  assertOk(res.ok, 'articles list not ok');
  const json = await res.json();
  console.log('articles list:', json.pagination);
  return json.articles?.[0]?.id;
}

async function testArticleDetail(articleId) {
  if (!articleId) return;
  const res = await fetch(`${BASE}/articles/${articleId}`);
  assertOk(res.ok, 'article detail not ok');
  console.log('article detail ok');
}

async function testCategories() {
  const res = await fetch(`${BASE}/articles/categories`);
  assertOk(res.ok, 'categories not ok');
  const json = await res.json();
  console.log('categories:', json.categories?.length);
}

async function testFeaturedArticles() {
  const res = await fetch(`${BASE}/articles/featured`);
  assertOk(res.ok, 'featured not ok');
  const json = await res.json();
  console.log('featured:', json.featured?.length);
}

async function testHomepageFeatured() {
  const res = await fetch(`${BASE}/homepage/featured`);
  assertOk(res.ok, 'homepage featured not ok');
  const json = await res.json();
  console.log('homepage featured:', json.featured?.length);
}

async function testSpecialAnalysis() {
  const res = await fetch(`${BASE}/special-analysis`);
  assertOk(res.ok, 'special analysis not ok');
  const json = await res.json();
  console.log('special analysis:', json.title);
}

async function testChatQuery() {
  // Với API AI, chỉ kiểm lỗi/ok
  const res = await fetch(`${BASE}/chat/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': 'test-session' },
    body: JSON.stringify({ question: 'Tư tưởng HCM về giáo dục là gì?', include_debug: true }),
  });
  assertOk(res.ok, 'chat query not ok');
  const json = await res.json();
  console.log('chat query: answer length=', json.answer?.length, 'sources=', json.sources?.length);
}

async function testChatStream() {
  // Mở stream rồi hủy ngay để không treo tiến trình
  const url = `${BASE}/chat/stream?q=${encodeURIComponent('Xin chào!')}`;
  const res = await fetch(url);
  assertOk(res.ok, 'chat stream not ok');
  // Hủy body để đóng kết nối SSE nhanh
  if (res.body && typeof res.body.cancel === 'function') await res.body.cancel();
  console.log('chat stream: opened and cancelled');
}

async function testChatReport() {
  const res = await fetch(`${BASE}/chat/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reference_id: 'msg_test', reason: 'Test reason' }),
  });
  assertOk(res.ok, 'chat report not ok');
  const json = await res.json();
  console.log('chat report:', json);
}

async function main() {
  try {
    await testHealth();
    await testStats();

    const docId = await testCorpusUpload();
    await sleep(1500);

    const listedFirstDocId = await testDocsList();
    if (listedFirstDocId) await testDocsDetail(listedFirstDocId);

    await testDocsSearch();

    if (listedFirstDocId) {
      // Try to get first chapter id from detail
      const detailRes = await fetch(`${BASE}/docs/${listedFirstDocId}`);
      const detail = await detailRes.json();
      const chapterId = detail.chapters?.[0]?.id;
      if (chapterId) await testDocsChunks(chapterId);
    }

    const articleId = await testArticlesList();
    await testArticleDetail(articleId);
    await testCategories();
    await testFeaturedArticles();
    await testHomepageFeatured();
    await testSpecialAnalysis();

    await testChatQuery();
    await testChatStream();
    await testChatReport();

    // Cleanup uploaded document
    if (docId) await testCorpusDelete(docId);

    console.log('\nAll tests passed.');
  } catch (e) {
    console.error('Test failed:', e.message);
    process.exit(1);
  }
}

main();
