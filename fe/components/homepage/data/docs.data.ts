import type { Doc } from "@/components/documents/DocumentList";

export const DOCS: Doc[] = [
  {
    id: "d1",
    title: "Tư tưởng Hồ Chí Minh về đoàn kết quốc tế",
    summary: "Khái quát hệ giá trị, bối cảnh lịch sử và vai trò đoàn kết quốc tế.",
    chapters: [
      { id: "d1c1", title: "Bối cảnh lịch sử", summary: "Điều kiện quốc tế chi phối giai đoạn đầu." },
      { id: "d1c2", title: "Nội hàm khái niệm", summary: "Khung khái niệm và nguyên tắc cốt lõi." },
      { id: "d1c3", title: "Vận dụng hiện nay", summary: "Chỉ dẫn còn giá trị trong chính sách đối ngoại." },
    ],
  },
  {
    id: "d2",
    title: "Quan điểm về hoà bình và hợp tác",
    summary: "Tư tưởng hoà bình gắn với hợp tác bình đẳng, tôn trọng luật pháp quốc tế.",
    chapters: [
      { id: "d2c1", title: "Nguyên tắc", summary: "Tôn trọng lẫn nhau, bình đẳng, cùng có lợi." },
      { id: "d2c2", title: "Phương thức", summary: "Đối thoại, ngoại giao nhân dân, văn hoá." },
    ],
  },
];
