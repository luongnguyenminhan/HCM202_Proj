"use client";
import ArticleHero from "@/components/analysis/ArticleHero";
import ArticleBody from "@/components/analysis/ArticleBody";
import {
  ANALYSIS_TITLE,
  ANALYSIS_SECTIONS,
} from "@/components/homepage/data/analysis.data";

/**
 * AnalysisSection:
 * - Standalone article block (hero + content sections)
 */
export default function AnalysisSection() {
  return (
    <section
      id="analysis"
      className="mt-12 border-t border-[color:var(--color-border)] pt-10"
    >
      <div className="mx-auto max-w-3xl px-4">
        <ArticleHero title={ANALYSIS_TITLE} />
        <ArticleBody sections={ANALYSIS_SECTIONS} />
      </div>
    </section>
  );
}
