"use client";

import React from "react";
import Modal from "@/components/base/Modal";

export type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

export default function DeleteConfirmModal({ open, title = "Xóa tài liệu", onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Modal open={open} title={title} confirmText="Xóa" cancelText="Hủy" onConfirm={onConfirm} onCancel={onCancel}>
      Hành động này không thể hoàn tác.
    </Modal>
  );
}