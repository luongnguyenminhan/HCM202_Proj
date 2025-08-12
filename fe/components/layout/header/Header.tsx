"use client";
import { useState } from "react";
import Brand from "./Brand";
import HeaderLink from "./HeaderLink";
import MobileMenu from "./MobileMenu";
import { NAV } from "./constants";
import type { HeaderProps } from "./types";

/**
 * Top navigation bar.
 * - Works in two modes:
 *   1) inPage=true (landing): non-chat items scroll to sections.
 *   2) inPage=false (default): items navigate to routes.
 * - "Chatbot" always triggers onOpenChat (if provided).
 */
export default function Header({ onOpenChat, inPage }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-background/70 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="nav-pill flex items-center justify-between px-3 py-2">
          <Brand />

          <button
            className="md:hidden rounded-full border px-3 py-1.5 text-sm"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label="Toggle menu"
          >
            Menu
          </button>

          <nav className="hidden md:block">
            <ul className="flex items-center gap-2">
              {NAV.map((item) => (
                <li key={item.key}>
                  <HeaderLink
                    item={item}
                    inPage={inPage}
                    onOpenChat={onOpenChat}
                    closeMenu={closeMenu}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileMenu open={open}>
        {NAV.map((item) => (
          <li key={item.key}>
            <HeaderLink
              item={item}
              inPage={inPage}
              onOpenChat={onOpenChat}
              closeMenu={closeMenu}
            />
          </li>
        ))}
      </MobileMenu>
    </header>
  );
}
