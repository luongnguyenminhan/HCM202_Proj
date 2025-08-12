"use client";
import Link from "next/link";

/** Brand block (logo + name) */
export default function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-lg bg-foreground" />
      <span className="text-sm font-semibold">HCM202</span>
    </Link>
  );
}
