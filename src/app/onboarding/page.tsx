import Link from "next/link";
import {
  addBillStream,
  finalizeOnboardingAndStart,
  saveOnboardingIncome,
  saveOnboardingSavings,
} from "@/app/actions/budget";
import { ActionError } from "@/components/ui/ActionError";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ClientTimezoneField } from "@/components/ui/ClientTimezoneField";
import { Field, inputClass, selectClass } from "@/components/ui/Field";
import { AppHeader } from "@/components/navigation/AppHeader";
import { guardOnboardingPage } from "@/lib/auth/guard";
import { appendNextToPath } from "@/lib/auth/redirect";
import { BILL_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { loadBudgetSnapshot } from "@/lib/data/loadBudget";
import { formatDailyAmount, formatMoney } from "@/lib/budget/formatMoney";

function OnboardingNextField({ next }: { next?: string }) {
  if (!next) return null;
  return <input type="hidden" name="next" value={next} />;
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const requestedStep = Number(params.step ?? "1") || 1;
  const { resolvedStep } = await guardOnboardingPage({
    requestedStep,
    next: params.next,
  });

  const { snapshot } = await loadBudgetSnapshot();

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-surface text-text-strong">
      <header className="border-b border-border-subtle bg-paper px-4 py-3">
        <AppHeader sectionLabel="Setup" showAppLinks />
      </header>
      <div className="px-4 py-8">
      <p className="mb-2 text-sm text-text-muted">Step {resolvedStep} of 4</p>
      <ActionError message={params.error} />

      {resolvedStep === 1 && (
        <>
          <h1 className="text-2xl font-bold">How much do you get paid?</h1>
          <p className="mt-2 text-text-muted">
            Use the amount that hits your account. If you need to reserve for
            tax, add it as a recurring bill.
          </p>
          <form action={saveOnboardingIncome} className="mt-6 space-y-2">
            <OnboardingNextField next={params.next} />
            <ClientTimezoneField />
            <Field label="Amount">
              <input
                className={inputClass}
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="10000"
              />
            </Field>
            <Field label="Frequency">
              <select className={selectClass} name="frequency" required>
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
              </select>
            </Field>
            <Field label="Next payday">
              <input
                className={inputClass}
                name="next_payday"
                type="date"
                required
              />
            </Field>
            <Field label="Currency">
              <select className={selectClass} name="currency" defaultValue="SGD">
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit">Continue</Button>
          </form>
        </>
      )}

      {resolvedStep === 2 && (
        <>
          <h1 className="text-2xl font-bold">How much do you want to save?</h1>
          <p className="mt-2 text-text-muted">
            We&apos;ll turn this into a daily savings target (protected, not
            spend).
          </p>
          <form action={saveOnboardingSavings} className="mt-6">
            <OnboardingNextField next={params.next} />
            <Field label="Amount">
              <input
                className={inputClass}
                name="amount"
                type="number"
                min="0"
                step="0.01"
                required
              />
            </Field>
            <Field label="Frequency">
              <select className={selectClass} name="frequency" required>
                <option value="weekly">Weekly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="monthly">Monthly</option>
                <option value="annually">Annually</option>
              </select>
            </Field>
            <Button type="submit">Continue</Button>
          </form>
        </>
      )}

      {resolvedStep === 3 && (
        <>
          <h1 className="text-2xl font-bold">
            What costs should we spread across your days?
          </h1>
          <p className="mt-2 text-text-muted">
            When these bills are paid, don&apos;t count them again. They&apos;re
            already in your fixed daily burn.
          </p>
          <form action={addBillStream} className="mt-6 space-y-2">
            <input type="hidden" name="return_to" value="onboarding" />
            <OnboardingNextField next={params.next} />
            <Field label="Name">
              <input className={inputClass} name="name" required />
            </Field>
            <Field label="Amount">
              <input
                className={inputClass}
                name="amount"
                type="number"
                min="0"
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
          <div className="mt-6">
            <Link
              href={appendNextToPath("/onboarding?step=4", params.next)}
              className="block text-center font-semibold text-brand-blue"
            >
              Continue to summary
            </Link>
          </div>
        </>
      )}

      {resolvedStep >= 4 && snapshot && (
        <>
          <h1 className="text-2xl font-bold">You&apos;re set up</h1>
          <Card className="mt-6 space-y-3">
            <p className="text-lg">
              You can spend{" "}
              <strong>
                {formatDailyAmount(
                  snapshot.manualDailyTargetCents,
                  snapshot.currency
                )}
              </strong>
            </p>
            <p className="text-text-muted">
              Fixed daily burn:{" "}
              {formatDailyAmount(
                snapshot.fixedDailyBurnCents,
                snapshot.currency
              )}
            </p>
            <p className="text-text-muted">
              Savings protected:{" "}
              {formatDailyAmount(
                snapshot.dailySavingsTargetCents,
                snapshot.currency
              )}
            </p>
            <p className="font-medium text-brand-blue">
              Beat{" "}
              {formatMoney(
                snapshot.manualDailyTargetCents,
                snapshot.currency,
                { wholeDollars: true }
              )}
              /day to hit your goal.
            </p>
          </Card>
          <form action={finalizeOnboardingAndStart} className="mt-6">
            <OnboardingNextField next={params.next} />
            <Button type="submit">Start today</Button>
          </form>
        </>
      )}

      {resolvedStep >= 4 && !snapshot && (
        <p className="text-text-muted">
          Finish income and savings setup first.{" "}
          <Link
            href={appendNextToPath("/onboarding?step=1", params.next)}
            className="text-brand-blue underline"
          >
            Go to step 1
          </Link>
        </p>
      )}
      </div>
    </div>
  );
}
