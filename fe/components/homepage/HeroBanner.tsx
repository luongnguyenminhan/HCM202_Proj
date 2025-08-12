import { MouseEvent } from "react";

export default function HeroBanner({
  onOpenChat,
}: {
  onOpenChat?: () => void;
}) {
  const handleScroll = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#features"); // cập nhật hash mà không giật
  };

  return (
    <section className="relative">
      <div className="absolute inset-y-0 left-0 -z-10 w-6 bg-accent/70 md:w-10" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-brand md:text-5xl">
            Tư tưởng Hồ Chí Minh <br /> về{" "}
            <span className="underline decoration-brand-700">
              Đoàn Kết Quốc Tế
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-foreground/80 md:text-lg">
            Kho tư liệu chuẩn hoá, công cụ tra cứu nhanh, và phân tích súc tích.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenChat}
              className="rounded-xl bg-brand px-5 py-3 text-surface transition hover:bg-brand-600"
            >
              BẮT ĐẦU TRA CỨU
            </button>

            {/* Scroll mượt tới #features */}
            <a
              href="#features"
              onClick={handleScroll}
              className="rounded-xl border px-5 py-3"
            >
              Tính năng chính
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border border-[color:var(--color-border)] bg-surface shadow-sm" />
          <p className="mt-3 text-center text-sm text-foreground/60">
            (Vùng minh hoạ)
          </p>
        </div>
      </div>
    </section>
  );
}
