import React from "react";

export default function ArticlesLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <section className="p-4 w-full h-full overflow-hidden">{children}</section>;
}


