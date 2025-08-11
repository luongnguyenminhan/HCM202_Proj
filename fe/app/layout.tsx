import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "antd/dist/reset.css";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HCM Thought — RAG",
  description: "Skeleton UI các trang (Home, Chat, Documents, Articles, Admin)",
  metadataBase: new URL("https://example.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased app-body`}>
        <header className="app-header">
          <Header />
        </header>
        <main className="app-main">
          {children}
        </main>
        <footer className="app-footer">
          <Footer />
        </footer>
      </body>
    </html>
  );
}
