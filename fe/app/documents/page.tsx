import { Metadata } from "next";
import { Row, Col } from "antd";
import DocumentList from "@/components/documents/DocumentList";
import DocumentDetail from "@/components/documents/DocumentDetail";
import ChapterList from "@/components/documents/ChapterList";

export const metadata: Metadata = {
    title: "Tài liệu | HCM Thought — RAG",
    description: "Skeleton Tài liệu với grid + detail pane",
    alternates: { canonical: "/documents" },
};

export default function DocumentsPage() {
    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col xs={24}>
                    <DocumentList />
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <Col xs={24} md={16}>
                    <ChapterList />
                </Col>
                <Col xs={24} md={8}>
                    <DocumentDetail />
                </Col>
            </Row>
        </div>
    );
}


