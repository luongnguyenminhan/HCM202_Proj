"use client";
import { PropsWithChildren } from "react";

/** Mobile drawer below the header bar */
export default function MobileMenu({
  open,
  children,
}: PropsWithChildren<{ open: boolean }>) {
  if (!open) return null;
  return (
    <nav className="mx-4 mb-3 rounded-2xl border border-[color:var(--color-border)] bg-surface md:hidden">
      <ul className="space-y-1.5 px-3 py-2">{children}</ul>
    </nav>
  );
}
