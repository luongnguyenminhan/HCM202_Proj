"use client";

import React from "react";

export type TextAreaProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  rows?: number;
};

export default function TextArea({ value, placeholder, onChange, className, disabled, rows }: TextAreaProps) {
  return (
    <textarea
      className={`textarea ${className ?? ""}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      rows={rows}
    />
  );
}