import type { NavItem } from "./types";

export const NAV: NavItem[] = [
  { key: "home",     label: "Home",     target: "home" },
  { key: "chat",     label: "Chatbot",  target: "chat" },
  { key: "docs",     label: "Tài liệu", target: "docs" },
  { key: "analysis", label: "Phân tích", target: "analysis" },
];

/** Approx header height (px) to offset anchored scrolling */
export const HEADER_H = 72;
