import Link from "next/link";
import Image from "next/image";
import hero from "@/public/images/asean.png";

export default function PRSection() {
  return (
    <section className="border-t border-[color:var(--color-border)] bg-accent/20">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center">
        {/* text */}
        <div className="order-2 md:order-1">
          <h2 className="text-2xl font-bold md:text-3xl">Giới thiệu nội dung corpus</h2>
          <p className="mt-3 text-foreground/85">
            Dự án tổng hợp, chuẩn hoá giúp các bạn học hỏi về các nguồn tài liệu
            liên quan đến tư tưởng Hồ Chí Minh một cách dễ dàng. Nội dung được
            dẫn nguồn rõ ràng; kèm tóm tắt súc tích cho từng phần để bạn nắm
            luận điểm chính nhanh chóng.
          </p>
          <div className="mt-6">
            {/* Nếu dùng điều hướng trong trang thì đổi href="#analysis" */}
            <Link
              href="/analysis"
              className="rounded-xl border px-5 py-3 font-medium hover:bg-accent/40"
            >
              Đọc phân tích chuyên đề
            </Link>
          </div>
        </div>

        {/* image */}
        <div className="order-1 md:order-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-surface shadow-sm">
            <Image
              src={hero}
              alt="Minh hoạ cho bài phân tích"
              fill
              className="object-cover"
              placeholder="blur"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <p className="mt-3 text-center text-sm text-foreground/60">Hình minh hoạ</p>
        </div>
      </div>
    </section>
  );
}
