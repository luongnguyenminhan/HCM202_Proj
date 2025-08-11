import { Metadata } from "next";
import { Row, Col } from "antd";
import UploadDocumentForm from "@/components/admin/UploadDocumentForm";
import DocumentTable from "@/components/admin/DocumentTable";
import ChunkPreview from "@/components/admin/ChunkPreview";
import DeleteConfirmModal from "@/components/admin/DeleteConfirmModal";

export const metadata: Metadata = {
    title: "Admin | HCM Thought — RAG",
    description: "Skeleton Admin với upload + table + chunk preview",
    robots: { index: false, follow: false },
    alternates: { canonical: "/admin" },
};

export default function AdminPage() {
    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
                <UploadDocumentForm />
            </Col>
            <Col xs={24} md={16}>
                <Row gutter={[16, 16]}>
                    <Col span={24}><DocumentTable /></Col>
                    <Col span={24}><ChunkPreview /></Col>
                    <Col span={24}><DeleteConfirmModal open={false} /></Col>
                </Row>
            </Col>
        </Row>
    );
}


