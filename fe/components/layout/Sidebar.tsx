import React from "react";
import Card from "@/components/base/Card";

export default function Sidebar({ children }: React.PropsWithChildren) {
  return <Card>{children ?? "Sidebar"}</Card>;
}