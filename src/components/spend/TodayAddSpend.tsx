"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AddSpendForm,
  type BillStreamOption,
} from "@/components/spend/AddSpendForm";
import { AddSpendSheet } from "@/components/spend/AddSpendSheet";
import { Button } from "@/components/ui/Button";

export function TodayAddSpend({
  manualDailyTargetCents,
  billStreams,
  financialTimezone,
}: {
  manualDailyTargetCents: number;
  billStreams: BillStreamOption[];
  financialTimezone: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  const handleSuccess = useCallback(() => {
    setOpen(false);
    router.refresh();
    requestAnimationFrame(() => triggerRef.current?.focus());
  }, [router]);

  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        className="block w-full"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        + Add spend
      </Button>
      <AddSpendSheet open={open} onClose={handleClose}>
        <AddSpendForm
          mode="modal"
          manualDailyTargetCents={manualDailyTargetCents}
          billStreams={billStreams}
          financialTimezone={financialTimezone}
          onSuccess={handleSuccess}
          autoFocusAmount
        />
      </AddSpendSheet>
    </>
  );
}
