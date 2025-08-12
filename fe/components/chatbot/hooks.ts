"use client";
import { useEffect } from "react";

/**
 * Locks body scroll when `lock=true`. Restores on cleanup.
 * Useful for modal overlays.
 */
export function useLockBodyScroll(lock: boolean) {
  useEffect(() => {
    if (!lock) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lock]);
}
