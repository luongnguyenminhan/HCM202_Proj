"use client";
import Link from "next/link";
import { MouseEvent } from "react";
import { usePathname } from "next/navigation";
import { HEADER_H } from "./constants";
import type { HeaderProps, NavItem } from "./types";
import { useIsClient } from "./useIsClient";

/**
 * Single navigation link:
 * - Chatbot opens dock
 * - When inPage=true, other items scroll to section id
 * - Avoid hydration mismatch by gating hash-based state until mounted
 */
export default function HeaderLink({
  item,
  inPage,
  onOpenChat,
  closeMenu,
}: {
  item: NavItem;
  inPage?: HeaderProps["inPage"];
  onOpenChat?: HeaderProps["onOpenChat"];
  closeMenu: () => void;
}) {
  const pathname = usePathname();
  const isClient = useIsClient(); // ← only true after mount

  const base =
    "rounded-full px-3 py-1.5 text-sm font-medium hover:bg-accent/40";
  const activeByPath =
    !inPage && pathname === `/${item.key === "home" ? "" : item.key}`;
  const activeByHash =
    inPage &&
    isClient &&
    typeof window !== "undefined" &&
    window.location.hash === `#${item.target}`;
  const active = activeByPath || activeByHash;

  const cls = active ? `${base} bg-accent/60` : base;

  if (item.key === "chat") {
    return (
      <a
        href="/chat"
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          onOpenChat?.();
          closeMenu();
        }}
        className={cls}
        suppressHydrationWarning // optional, thêm an toàn
      >
        {item.label}
      </a>
    );
  }

  if (inPage && pathname === "/") {
    const scrollToId = (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H;
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", `#${id}`);
    };

    return (
      <a
        href={`#${item.target}`}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          scrollToId(item.target);
          closeMenu();
        }}
        className={cls}
        suppressHydrationWarning
      >
        {item.label}
      </a>
    );
  }

  const href = item.key === "home" ? "/" : `/${item.key}`;
  return (
    <Link href={href} className={cls} onClick={closeMenu}>
      {item.label}
    </Link>
  );
}
