import { Metadata } from "next";
import ArticleList from "@/components/articles/ArticleList";
import ArticleCategoryMenu from "@/components/articles/ArticleCategoryMenu";
import ArticleSidebar from "@/components/articles/ArticleSidebar";

export const metadata: Metadata = {
    title: "Phân tích | HCM Thought — RAG",
    description: "Skeleton Bài viết & Phân tích với list + sidebar",
    alternates: { canonical: "/articles" },
};

export default function ArticlesPage() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 h-full overflow-hidden">
                <ArticleList />
            </div>
            <div className="md:col-span-1 h-full overflow-hidden grid gap-4">
                <ArticleCategoryMenu />
                <ArticleSidebar />
            </div>
        </div>
    );
}


