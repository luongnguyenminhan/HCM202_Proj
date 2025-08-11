import React from "react";

export default function MainLayout({ children }: React.PropsWithChildren) {
  return <div className="bordered-page">{children}</div>;
}