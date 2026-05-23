import {
  addBillPayment,
  addBillStream,
  updateBillStream,
} from "@/app/actions/budget";
import { ActionError } from "@/components/ui/ActionError";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, inputClass, selectClass } from "@/components/ui/Field";
import { guardAuthenticatedAppRoute } from "@/lib/auth/guard";
import { annualiseToDailyCents } from "@/lib/budget/frequencies";
import { formatMoney } from "@/lib/budget/formatMoney";
import { estimateBillStreamAmountCents } from "@/lib/budget/billEstimates";
import { parseDateOnly } from "@/lib/budget/payCycles";
import { parseRecurringFrequency } from "@/lib/db/domain";
import {
  getUserReferenceDate,
  loadBillStreamsWithPayments,
  loadBudgetSnapshot,
} from "@/lib/data/loadBudget";
import { BILL_CATEGORIES } from "@/lib/constants";

export default async function FixedCostsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await guardAuthenticatedAppRoute("/fixed-costs");

  const params = await searchParams;
  const { snapshot } = await loadBudgetSnapshot();
  const { today } = await getUserReferenceDate();
  const rows = await loadBillStreamsWithPayments();
  const currency = snapshot?.currency ?? "SGD";

  return (
    <AppShell activePath="/fixed-costs">
      <p className="mb-6 text-sm text-text-muted">
        Recurring bills spread into your fixed daily burn.
      </p>
      <ActionError message={params.error} />

      <ul className="mb-8 space-y-4">
        {rows.map(({ stream, payments }) => {
          const frequency = parseRecurringFrequency(stream.frequency);
          const paymentInputs = payments.map((p) => ({
            billStreamId: p.bill_stream_id,
            amountCents: p.amount_cents,
            paidOn: parseDateOnly(p.paid_on),
          }));
          const estimate = estimateBillStreamAmountCents(
            frequency,
            stream.estimated_amount_cents,
            paymentInputs
          );
          const daily = annualiseToDailyCents(estimate, frequency);
          const last = payments[0];

          return (
            <Card key={stream.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-text-strong">{stream.name}</p>
                  <p className="text-sm text-text-muted">
                    {formatMoney(estimate, currency, { wholeDollars: true })}/
                    {frequency === "annually" ? "year" : frequency}
                    {" · "}
                    about {formatMoney(daily, currency, { wholeDollars: true })}
                    /day fixed burn
                  </p>
                  {last && (
                    <p className="mt-1 text-sm text-text-muted">
                      Last payment:{" "}
                      {formatMoney(last.amount_cents, currency, {
                        wholeDollars: true,
                      })}
                    </p>
                  )}
                  {!stream.is_active && (
                    <p className="mt-1 text-xs text-text-muted">Paused</p>
                  )}
                </div>
              </div>

              <form action={updateBillStream} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={stream.id} />
                <input type="hidden" name="name" value={stream.name} />
                <input type="hidden" name="category" value={stream.category} />
                <input type="hidden" name="frequency" value={stream.frequency} />
                <input
                  type="hidden"
                  name="amount"
                  value={(estimate / 100).toFixed(2)}
                />
                <input
                  type="hidden"
                  name="is_active"
                  value={stream.is_active ? "false" : "true"}
                />
                <button
                  type="submit"
                  className="text-sm text-brand-blue underline"
                >
                  {stream.is_active ? "Pause" : "Resume"}
                </button>
              </form>

              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-brand-blue">
                  Add payment
                </summary>
                <form action={addBillPayment} className="mt-2 space-y-2">
                  <input type="hidden" name="bill_stream_id" value={stream.id} />
                  <input
                    className={inputClass}
                    name="amount"
                    type="number"
                    step="0.01"
                    placeholder="Amount"
                    required
                  />
                  <input
                    className={inputClass}
                    name="paid_on"
                    type="date"
                    defaultValue={today}
                    required
                  />
                  <Button type="submit" variant="secondary">
                    Record payment
                  </Button>
                </form>
              </details>
            </Card>
          );
        })}
      </ul>

      <Card>
        <h2 className="mb-3 font-semibold text-text-strong">Add bill stream</h2>
        <form action={addBillStream} className="space-y-2">
          <Field label="Name">
            <input className={inputClass} name="name" required />
          </Field>
          <Field label="Amount">
            <input
              className={inputClass}
              name="amount"
              type="number"
              step="0.01"
              required
            />
          </Field>
          <Field label="Frequency">
            <select className={selectClass} name="frequency" required>
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annually">Yearly</option>
            </select>
          </Field>
          <Field label="Category">
            <select className={selectClass} name="category">
              {BILL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" variant="secondary">
            Add bill stream
          </Button>
        </form>
      </Card>
    </AppShell>
  );
}
