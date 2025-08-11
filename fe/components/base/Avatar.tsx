"use client";

import React from "react";

export type AvatarProps = {
  name?: string;
  src?: string;
  size?: number;
  className?: string;
};

export default function Avatar({ name, src, size = 32, className }: AvatarProps) {
  const initials = (name ?? "?").trim().slice(0, 1).toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={`avatar ${className ?? ""}`} src={src} alt={name} style={{ width: size, height: size }} />
  ) : (
    <span className={`avatar ${className ?? ""}`} style={{ width: size, height: size }}>
      {initials}
    </span>
  );
}