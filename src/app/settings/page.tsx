import { signOut } from "@/app/actions/auth";
import { updateSettings } from "@/app/actions/budget";
import { ActionError } from "@/components/ui/ActionError";
import { AppShell } from "@/components/ui/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, inputClass, selectClass } from "@/components/ui/Field";
import { guardAuthenticatedAppRoute } from "@/lib/auth/guard";
import { LegalLinks } from "@/components/info/LegalLinks";
import { FinancialTimezoneSelect } from "@/components/settings/FinancialTimezoneSelect";
import { CURRENCIES } from "@/lib/constants";
import { parseProfileTimezone } from "@/lib/db/domain";
import { loadSettingsData } from "@/lib/data/loadBudget";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await guardAuthenticatedAppRoute("/settings");

  const params = await searchParams;
  const data = await loadSettingsData();
  if (!data?.settings || !data.savings) {
    throw new Error("Settings unavailable after onboarding guard.");
  }

  const timezone = parseProfileTimezone(data.profile?.timezone);

  return (
    <AppShell activePath="/settings">
      <ActionError message={params.error} />

      <Card className="mb-4">
        <h2 className="mb-3 font-semibold text-text-strong">Income & pay cycle</h2>
        <form action={updateSettings} className="space-y-2">
          <Field label="Income amount">
            <input
              className={inputClass}
              name="income_amount"
              type="number"
              step="0.01"
              defaultValue={(data.settings.income_amount_cents / 100).toFixed(
                2
              )}
              required
            />
          </Field>
          <Field label="Pay frequency">
            <select
              className={selectClass}
              name="income_frequency"
              defaultValue={data.settings.income_frequency}
            >
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
              defaultValue={data.settings.next_payday}
              required
            />
          </Field>
          <h2 className="mb-2 pt-4 font-semibold text-text-strong">
            Savings target
          </h2>
          <Field label="Savings amount">
            <input
              className={inputClass}
              name="savings_amount"
              type="number"
              step="0.01"
              defaultValue={(data.savings.amount_cents / 100).toFixed(2)}
              required
            />
          </Field>
          <Field label="Savings frequency">
            <select
              className={selectClass}
              name="savings_frequency"
              defaultValue={data.savings.frequency}
            >
              <option value="weekly">Weekly</option>
              <option value="fortnightly">Fortnightly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
          </Field>
          <Field label="Currency">
            <select
              className={selectClass}
              name="currency"
              defaultValue={data.profile?.currency ?? "SGD"}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <FinancialTimezoneSelect value={timezone} />
          <Button type="submit">Save changes</Button>
        </form>
      </Card>

      <Card className="mb-4">
        <h2 className="mb-2 font-semibold text-text-strong">App info</h2>
        <p className="mb-4 text-sm text-text-muted">
          How Burnline works, privacy, security, and terms — plain English, no
          corporate fluff.
        </p>
        <LegalLinks />
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="secondary">
          Log out
        </Button>
      </form>
    </AppShell>
  );
}
