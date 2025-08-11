"use client";

import React from "react";

export type InputProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
};

export default function Input({ value, placeholder, onChange, type = "text", className, disabled }: InputProps) {
  return (
    <input
      className={`input ${className ?? ""}`}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    />
  );
}