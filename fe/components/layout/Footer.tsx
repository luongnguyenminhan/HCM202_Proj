export default function Footer() {
  return (
    <footer className="border-t border-[color:var(--color-border)] bg-background/85">
      <div className="w-full px-6 py-8">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-foreground" />
            <span className="text-sm font-semibold">HCM202</span>
          </div>

          {/* Center: Nav */}
          <nav className="justify-self-center">
            <ul className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
              <li>
                <a className="hover:text-foreground" href="/docs">
                  Tài liệu
                </a>
              </li>
              <li className="opacity-40">•</li>
              <li>
                <a className="hover:text-foreground" href="/analysis">
                  Phân tích
                </a>
              </li>
              <li className="opacity-40">•</li>
              <li>
                <a className="hover:text-foreground" href="/report">
                  Báo cáo nội dung
                </a>
              </li>
              <li className="opacity-40">•</li>
              <li>
                <a className="hover:text-foreground" href="/contact">
                  Liên hệ
                </a>
              </li>
            </ul>
          </nav>

          {/* Right: Copyright */}
          <div className="justify-self-start text-xs text-foreground/60 md:justify-self-end">
            © {new Date().getFullYear()} HCM202. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
