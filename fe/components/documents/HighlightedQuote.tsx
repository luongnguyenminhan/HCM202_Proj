import React from "react";
import Card from "@/components/base/Card";

export type HighlightedQuoteProps = {
  quote: string;
  source?: string;
};

export default function HighlightedQuote({ quote, source }: HighlightedQuoteProps) {
  return (
    <Card>
      <blockquote style={{ fontSize: 16, fontStyle: "italic" }}>
        “{quote}” {source && <span className="typo-muted">— {source}</span>}
      </blockquote>
    </Card>
  );
}