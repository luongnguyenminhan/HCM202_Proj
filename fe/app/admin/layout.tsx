import React from "react";

export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <section style={{ padding: 16, width: "100%" }}>{children}</section>;
}


