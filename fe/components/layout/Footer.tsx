export default function Footer({ sticky = false }: { sticky?: boolean }) {
  return (
    <footer
      className={[
        sticky ? "sticky bottom-0 z-10" : "",
        "mt-16 border-t border-[color:var(--color-border)] bg-background",
      ].join(" ")}
    >
      <div className="mx-auto max-w-7xl px-4 py-6 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex gap-5 text-sm text-foreground/70">
          <a href="#docs" className="hover:underline">
            Tài liệu
          </a>
          <a href="#analysis" className="hover:underline">
            Phân tích
          </a>
          <a href="#report" className="hover:underline">
            Báo cáo nội dung
          </a>
          <a href="#contact" className="hover:underline">
            Liên hệ
          </a>
        </nav>
        <p className="text-xs text-foreground/60">
          © 2025 HCM202 Nhóm 9. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
