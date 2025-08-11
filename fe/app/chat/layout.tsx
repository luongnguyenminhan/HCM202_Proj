import React from "react";

export default function ChatLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <section style={{ padding: 16, width: "100%", height: "100%", overflow: "hidden" }}>{children}</section>;
}


