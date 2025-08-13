// app/analysis/page.tsx
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ArticleHero from "@/components/analysis/ArticleHero";
import ArticleBody from "@/components/analysis/ArticleBody";

// Data tĩnh
import {
  ANALYSIS_TITLE,
  ANALYSIS_SECTIONS,
} from "@/components/homepage/data/analysis.data";

// Bắt buộc build tĩnh
export const dynamic = "force-static";

export const metadata = {
  title:
    "Phân tích: “Dĩ bất biến, ứng vạn biến” & ngoại giao “Cây tre Việt Nam”",
  description:
    "Tóm lược và phân tích ngắn gọn về mối liên hệ giữa tư tưởng của Chủ tịch Hồ Chí Minh và trường phái ngoại giao “Cây tre Việt Nam”.",
};

export default function AnalysisPage() {
  return (
    <>
      <Header />
      <main className="bg-background">
        <section className="mx-auto max-w-3xl px-4 py-10">
          {/* Hero & nội dung bài viết */}
          <ArticleHero title={ANALYSIS_TITLE} />
          <ArticleBody sections={ANALYSIS_SECTIONS} />
        </section>
      </main>
      <Footer />
    </>
  );
}
