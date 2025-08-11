"use client";

import React from "react";
import Card from "@/components/base/Card";
import SourceList from "./SourceList";
import { getTopSources } from "@/services/mock";

export default function ContextPane() {
  const sources = getTopSources(5);
  return (
    <Card title="Nguồn trích dẫn liên quan" bodyClassName="h-[calc(90vh-65px)] flex flex-col">
      <div className="flex-1 overflow-auto">
        <SourceList sources={sources} />
      </div>
    </Card>
  );
}