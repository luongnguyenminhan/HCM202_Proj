"use client";

/**
 * HeaderBar: title + "Report issue" and "Close" buttons.
 */
export default function HeaderBar({
  onClose,
  onOpenReport,
}: {
  onClose: () => void;
  onOpenReport: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-base font-semibold">Chatbot</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenReport}
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent/40"
        >
          Báo cáo sai lệch
        </button>
        <button
          onClick={onClose}
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-accent/40"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
