import { Metadata } from "next";
import { Row, Col } from "antd";
import ChatWindow from "@/components/chatbot/ChatWindow";
import ChatInput from "@/components/chatbot/ChatInput";
import ContextPane from "@/components/chatbot/ContextPane";

export const metadata: Metadata = {
    title: "Chatbot | HCM Thought — RAG",
    description: "Skeleton Chatbot với split layout và placeholder components",
    alternates: { canonical: "/chat" },
};

export default function ChatPage() {
    return (
        <Row gutter={[16, 16]} style={{ height: "100%" }}>
            <Col xs={24} md={16} style={{ height: "100%", overflow: "hidden" }}>
                <ChatWindow />
                <div style={{ marginTop: 12 }}>
                    <ChatInput />
                </div>
            </Col>
            <Col xs={24} md={8} style={{ height: "100%", overflow: "hidden" }}>
                <ContextPane />
            </Col>
        </Row>
    );
}


