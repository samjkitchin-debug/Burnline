"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addManualSpend,
  spreadSpendAsBill,
} from "@/app/actions/budget";
import { Button } from "@/components/ui/Button";
import { Field, inputClass, selectClass } from "@/components/ui/Field";
import { annualiseToDailyCents } from "@/lib/budget/frequencies";
import type { RecurringFrequency } from "@/lib/budget/types";
import { getTodayDateStringInTimezone } from "@/lib/dates/timezone";
import { parseDollarsToCentsSafe } from "@/lib/money/parseDollarsToCents";
import { SPEND_CATEGORIES, type SpendCategory } from "@/lib/constants";

export type BillStreamOption = { id: string; name: string };

export function AddSpendForm({
  manualDailyTargetCents,
  billStreams,
  financialTimezone,
  mode = "page",
  onSuccess,
  autoFocusAmount = false,
}: {
  manualDailyTargetCents: number;
  billStreams: BillStreamOption[];
  financialTimezone: string;
  mode?: "modal" | "page";
  onSuccess?: () => void;
  autoFocusAmount?: boolean;
}) {
  const router = useRouter();
  const amountRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState<SpendCategory>("Food");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [treatment, setTreatment] = useState<
    "count_today_only" | "spread_as_recurring_bill" | "already_included" | null
  >(null);
  const [billFrequency, setBillFrequency] = useState("monthly");
  const [billStreamId, setBillStreamId] = useState("");
  const [newBillName, setNewBillName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const parsedAmount = parseDollarsToCentsSafe(amount);
  const amountCents = "cents" in parsedAmount ? parsedAmount.cents : 0;
  const [askTreatment, setAskTreatment] = useState(false);

  const needsTreatment =
    amountCents > 0 &&
    (category === "Bills" || amountCents >= manualDailyTargetCents * 0.5);

  const showTreatmentPrompt = askTreatment && treatment === null && needsTreatment;

  const dailyFromBill = useMemo(() => {
    if (!amountCents) return 0;
    return annualiseToDailyCents(
      amountCents,
      billFrequency as RecurringFrequency
    );
  }, [amountCents, billFrequency]);

  useEffect(() => {
    if (autoFocusAmount) {
      amountRef.current?.focus();
    }
  }, [autoFocusAmount]);

  const finishSuccess = useCallback(() => {
    if (onSuccess) {
      onSuccess();
      return;
    }
    router.push("/today");
  }, [onSuccess, router]);

  function appendSpentOn(form: FormData) {
    form.set("spent_on", getTodayDateStringInTimezone(financialTimezone));
  }

  async function handleCountToday() {
    setError(null);
    if ("error" in parsedAmount) {
      setError(parsedAmount.error);
      return;
    }
    setSaving(true);
    const form = new FormData();
    form.set("amount", amount);
    form.set("category", category);
    form.set("note", note);
    appendSpentOn(form);
    const result = await addManualSpend(form);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    finishSuccess();
  }

  async function handleSpreadBill() {
    setError(null);
    if ("error" in parsedAmount) {
      setError(parsedAmount.error);
      return;
    }
    setSaving(true);
    const form = new FormData();
    form.set("amount", amount);
    form.set("frequency", billFrequency);
    form.set("name", newBillName || category);
    form.set("category", category);
    appendSpentOn(form);
    if (billStreamId) form.set("bill_stream_id", billStreamId);
    const result = await spreadSpendAsBill(form);
    setSaving(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (mode === "modal") {
      finishSuccess();
      return;
    }
    setDoneMessage(
      `That's about $${(dailyFromBill / 100).toFixed(0)}/day added to your fixed daily burn.`
    );
    setTimeout(() => finishSuccess(), 1500);
  }

  if (doneMessage) {
    return <p className="font-medium text-positive">{doneMessage}</p>;
  }

  if (treatment === "already_included") {
    return (
      <div className="space-y-4">
        <p className="text-text-strong">
          Already covered. We won&apos;t count this again.
        </p>
        <Button type="button" onClick={finishSuccess}>
          Back to today
        </Button>
      </div>
    );
  }

  if (treatment === "spread_as_recurring_bill") {
    return (
      <div className="space-y-4">
        <p className="font-medium text-text-strong">
          How often do you get this bill?
        </p>
        <select
          className={selectClass}
          value={billFrequency}
          onChange={(e) => setBillFrequency(e.target.value)}
        >
          <option value="weekly">Weekly</option>
          <option value="fortnightly">Fortnightly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Yearly</option>
        </select>
        {billStreams.length > 0 && (
          <Field label="Add to existing bill stream">
            <select
              className={selectClass}
              value={billStreamId}
              onChange={(e) => setBillStreamId(e.target.value)}
            >
              <option value="">Create new</option>
              {billStreams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {!billStreamId && (
          <Field label="Bill name">
            <input
              className={inputClass}
              value={newBillName}
              onChange={(e) => setNewBillName(e.target.value)}
            />
          </Field>
        )}
        <Button type="button" onClick={handleSpreadBill} disabled={saving}>
          Confirm
        </Button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (showTreatmentPrompt) {
    return (
      <div className="space-y-4">
        <p className="text-lg font-semibold text-text-strong">
          What kind of spend is this?
        </p>
        <Button
          type="button"
          disabled={saving}
          onClick={() => {
            setTreatment("count_today_only");
            void handleCountToday();
          }}
        >
          Count today only
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setTreatment("spread_as_recurring_bill")}
        >
          Spread as recurring bill
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setTreatment("already_included")}
        >
          Already included
        </Button>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Field label="Amount">
        <input
          ref={amountRef}
          className={inputClass}
          type="text"
          inputMode="decimal"
          enterKeyHint="done"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          aria-required
        />
      </Field>
      <div>
        <span className="mb-2 block text-sm font-medium text-text-strong">
          Category
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
          {SPEND_CATEGORIES.map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`min-h-11 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                  selected
                    ? "border-accent-gold/30 bg-nav-active-bg text-nav-active-text"
                    : "border-border-subtle bg-paper text-text-muted hover:bg-brand-blue-soft/70 hover:text-text-strong"
                }`}
                aria-pressed={selected}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <Field label="Note (optional)">
        <input
          className={inputClass}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Field>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={() => {
          if ("error" in parsedAmount) {
            setError(parsedAmount.error);
            return;
          }
          if (!amountCents) return;
          if (needsTreatment) {
            setAskTreatment(true);
            return;
          }
          void handleCountToday();
        }}
        disabled={!amount.trim() || saving}
      >
        {saving ? "Saving…" : "Save spend"}
      </Button>
    </div>
  );
}
