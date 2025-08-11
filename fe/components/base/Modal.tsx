"use client";

import React from "react";
import Button from "@/components/base/Button";

export type ModalProps = {
  open: boolean;
  title?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function Modal({ open, title, children, confirmText = "Xác nhận", cancelText = "Hủy", onConfirm, onCancel }: ModalProps) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="dialog" aria-modal>
      <div className="modal">
        {title && <div className="card-title">{title}</div>}
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <Button variant="ghost" onClick={onCancel}>{cancelText}</Button>
          <Button variant="primary" onClick={onConfirm}>{confirmText}</Button>
        </div>
      </div>
    </div>
  );
}