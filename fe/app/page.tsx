import { Metadata } from "next";
import HeroBanner from "@/components/homepage/HeroBanner";
import FeaturedArticles from "@/components/homepage/FeaturedArticles";
import PRSection from "@/components/homepage/PRSection";
import LatestArticles from "@/components/homepage/LatestArticles";

export const metadata: Metadata = {
  title: "Home | HCM Thought — RAG",
  description: "Skeleton Home với layout grid và placeholder components",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <div className="w-full h-full p-4 grid gap-4">
      {/* Hero + Featured/PR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <HeroBanner />
        </div>
        <div className="lg:col-span-1 grid gap-4">
          <FeaturedArticles />
          <PRSection />
        </div>
      </div>

      {/* Articles carousel */}
      <LatestArticles />
    </div>
  );
}
