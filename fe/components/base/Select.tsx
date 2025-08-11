"use client";

import React from "react";

export type Option = { label: string; value: string };
export type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];
  className?: string;
  disabled?: boolean;
};

export default function Select({ value, onChange, options, className, disabled }: SelectProps) {
  return (
    <select
      className={`select ${className ?? ""}`}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}