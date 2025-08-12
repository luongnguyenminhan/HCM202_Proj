// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";

// Gắn vào đúng biến mà bạn đã khai báo trong globals.css
const sans = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const mono = Roboto_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "HCM202 – Landing",
  description: "Kho tư liệu, tra cứu nhanh và phân tích.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={`${sans.variable} ${mono.variable}`}>
      {/* Dùng token Tailwind v4 đã định nghĩa trong @theme inline */}
      <body className="bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
