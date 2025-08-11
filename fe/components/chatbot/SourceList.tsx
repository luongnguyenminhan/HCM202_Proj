"use client";

import React from "react";
import { RAGSource } from "@/types";
import SourceItem from "./SourceItem";

export type SourceListProps = { sources: RAGSource[] };

export default function SourceList({ sources }: SourceListProps) {
  return (
    <div className="grid gap-2">
      {sources.map((s) => (
        <SourceItem key={s.chunkId} source={s} />
      ))}
    </div>
  );
}