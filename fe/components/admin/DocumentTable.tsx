"use client";

import React from "react";
import Card from "@/components/base/Card";
import Button from "@/components/base/Button";
import { getDocumentsMeta } from "@/services/mock";

export default function DocumentTable() {
  const docs = getDocumentsMeta();
  return (
    <Card title="Danh sách tài liệu">
      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Nguồn</th>
              <th>Năm</th>
              <th>Thẻ</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td className="typo-muted">{d.source}</td>
                <td>{d.year ?? ""}</td>
                <td>{d.tags.join(", ")}</td>
                <td>
                  <Button size="sm" onClick={() => alert(`Xem ${d.id}`)}>Xem</Button>
                  <Button size="sm" variant="ghost" onClick={() => alert(`Xóa ${d.id}`)} style={{ marginLeft: 6 }}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}