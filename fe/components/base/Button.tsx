"use client";

import React from "react";

export type ButtonProps = {
  children?: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  block?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
};

export default function Button({
  children,
  variant = "secondary",
  size = "md",
  block,
  disabled,
  onClick,
  type = "button",
  className,
  iconLeft,
  iconRight,
  style,
}: ButtonProps) {
  const classes = [
    "btn",
    variant === "primary" ? "btn-primary" : variant === "ghost" ? "btn-ghost" : "btn-secondary",
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    block ? "w-full" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled} style={style}>
      {iconLeft && <span>{iconLeft}</span>}
      <span>{children}</span>
      {iconRight && <span>{iconRight}</span>}
    </button>
  );
}