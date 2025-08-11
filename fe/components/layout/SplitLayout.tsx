import React from "react";

export type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
  leftSpan?: number; // 0..1
};

export default function SplitLayout({ left, right, gap = 16, leftSpan = 0.66 }: SplitLayoutProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `${leftSpan * 100}% 1fr`, gap }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}