"use client";

import React, { useState } from "react";
import { getDocumentsMeta } from "@/services/mock";
import DocumentCard from "./DocumentCard";

export default function DocumentList() {
  const [docs] = useState(getDocumentsMeta());
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {docs.map((d) => (
        <DocumentCard key={d.id} doc={d} onOpen={(id) => alert(`Open ${id}`)} />
      ))}
    </div>
  );
}