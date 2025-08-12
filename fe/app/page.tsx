"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SplitShell from "@/components/layout/SplitShell";
import HomeSection from "@/components/homepage/sections/HomeSection";
import DocsSection from "@/components/homepage/sections/DocsSection";
import AnalysisSection from "@/components/homepage/sections/AnalysisSection";

/**
 * Landing page
 * - Composes all sections inside a split layout (chat dock + content).
 * - On first load / refresh, force URL to `/#home` and align content under header.
 */
export default function Page() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const TARGET = "#home";
    const HEADER_H = 72;

    const goHome = () => {
      if (location.hash !== TARGET) {
        history.replaceState(null, "", TARGET);
      }
      const el = document.getElementById("home");
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - HEADER_H;
        window.scrollTo({ top: y, behavior: "auto" });
      } else {
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };

    // wait one frame to ensure sections are in the DOM before scrolling
    requestAnimationFrame(goHome);
  }, []);

  return (
    <>
      <Header inPage onOpenChat={() => setOpen(true)} />

      <SplitShell
        open={open}
        onOpenChat={() => setOpen(true)}
        onCloseChat={() => setOpen(false)}
      >
        <HomeSection onOpenChat={() => setOpen(true)} />
        <DocsSection />
        <AnalysisSection />
      </SplitShell>

      <Footer />
    </>
  );
}
