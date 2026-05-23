"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function AddSpendSheet({
  open,
  onClose,
  titleId = "add-spend-title",
  title = "Add spend",
  children,
}: {
  open: boolean;
  onClose: () => void;
  titleId?: string;
  title?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="add-spend-sheet fixed bottom-0 left-1/2 m-0 w-full max-w-md -translate-x-1/2 rounded-t-[20px] border border-border-subtle border-b-0 bg-paper p-0 text-text-strong shadow-[0_-8px_32px_rgb(15_39_68_/12%)] backdrop:bg-[rgb(15_39_68_/0.35)] open:animate-none max-sm:max-h-[92dvh] sm:top-1/2 sm:bottom-auto sm:max-h-[min(90dvh,640px)] sm:-translate-y-1/2 sm:rounded-[20px] sm:border-b"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-5 py-4">
        <h2 id={titleId} className="text-lg font-semibold text-brand-blue">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="min-h-11 shrink-0 rounded-full px-3 text-sm font-medium text-text-muted transition hover:bg-brand-blue-soft/70 hover:text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
        >
          Cancel
        </button>
      </div>
      <div className="max-h-[min(70dvh,520px)] overflow-y-auto overscroll-contain px-5 py-4">
        {children}
      </div>
    </dialog>
  );
}
