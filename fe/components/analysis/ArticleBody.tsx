"use client";
import React from "react";

export type Section = {
  heading: string;
  body: string | React.ReactNode;
};

function linkify(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let key = 0;

  // 1) Biến pattern "Nhãn: https://..." -> <a>Nhãn</a> (ẩn URL)
  //    Ví dụ: "Trường Chính Trị Thanh Hóa: https://truong..." => <a>Trường Chính Trị Thanh Hóa</a>
  const labelUrl = /([^:()\n]+?):\s*(https?:\/\/[^\s,)\]]+)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = labelUrl.exec(text)) !== null) {
    const [full, label, url] = m;
    if (m.index > lastIndex) {
      nodes.push(text.slice(lastIndex, m.index));
    }
    nodes.push(
      <a
        key={`lu-${key++}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline hover:text-blue-700"
      >
        {label.trim()}
      </a>
    );
    lastIndex = m.index + full.length;
  }

  const tail = text.slice(lastIndex);
  if (tail) {
    // 2) Bọc mọi URL còn sót lại -> <a>domain...</a>
    const urlOnly = /(https?:\/\/[^\s,)\]]+)/g;
    let last = 0;
    let u: RegExpExecArray | null;

    while ((u = urlOnly.exec(tail)) !== null) {
      if (u.index > last) nodes.push(tail.slice(last, u.index));
      const url = u[1];
      // hiển thị ngắn gọn phần domain thay vì full URL
      const short = url.replace(/^https?:\/\//, "");
      nodes.push(
        <a
          key={`uo-${key++}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-700"
        >
          {short}
        </a>
      );
      last = urlOnly.lastIndex;
    }
    if (last < tail.length) nodes.push(tail.slice(last));
  }

  return nodes;
}

export default function ArticleBody({ sections }: { sections: Section[] }) {
  return (
    <div className="prose prose-neutral max-w-none">
      {sections.map((s, i) => (
        <section key={i} className="mb-8">
          {s.heading && (
            <h3 className="mb-3 text-xl font-semibold">{s.heading}</h3>
          )}

          {/* Nếu body là string -> tách đoạn và linkify; nếu là ReactNode -> render thẳng */}
          {typeof s.body === "string" ? (
            s.body
              .trim()
              .split(/\n{2,}/)
              .map((para, idx) => (
                <p key={idx} className="leading-7 text-foreground/80 mb-4 last:mb-0">
                  {linkify(para)}
                </p>
              ))
          ) : (
            <div className="leading-7 text-foreground/80">{s.body}</div>
          )}
        </section>
      ))}
    </div>
  );
}
