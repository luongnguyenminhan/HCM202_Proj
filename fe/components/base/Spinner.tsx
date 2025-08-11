"use client";

import React from "react";

export type SpinnerProps = { size?: number; className?: string };

export default function Spinner({ size = 18, className }: SpinnerProps) {
  return <span className={`spinner ${className ?? ""}`} style={{ width: size, height: size }} />;
}