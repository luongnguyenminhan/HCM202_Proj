"use client";

import React from "react";

export type BadgeProps = {
  children?: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
};

export default function Badge({ children, variant = "outline", className }: BadgeProps) {
  const classes = ["badge", variant === "solid" ? "badge-solid" : "badge-outline", className ?? ""].join(" ");
  return <span className={classes}>{children}</span>;
}