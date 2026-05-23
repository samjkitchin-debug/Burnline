import { AppShell } from "@/components/ui/AppShell";
import { TodayAddSpend } from "@/components/spend/TodayAddSpend";
import { TodayHero } from "@/components/today/TodayHero";
import { guardAuthenticatedAppRoute } from "@/lib/auth/guard";
import { formatMoney } from "@/lib/budget/formatMoney";
import { PayCyclePositionCard } from "@/components/today/PayCyclePositionCard";
import {
  loadBudgetSnapshot,
  loadProfileTimezone,
  loadTodayManualSpends,
} from "@/lib/data/loadBudget";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function TodayPage() {
  const { userId } = await guardAuthenticatedAppRoute("/today");

  const [{ snapshot }, financialTimezone, entries] = await Promise.all([
    loadBudgetSnapshot(),
    loadProfileTimezone(userId),
    loadTodayManualSpends(),
  ]);
  if (!snapshot) {
    throw new Error("Budget snapshot unavailable after onboarding guard.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: streams } = await supabase
    .from("bill_streams")
    .select("id, name")
    .eq("user_id", userId)
    .eq("is_active", true);

  return (
    <AppShell activePath="/today">
      <TodayHero snapshot={snapshot} />

      <TodayAddSpend
        manualDailyTargetCents={snapshot.manualDailyTargetCents}
        billStreams={streams ?? []}
        financialTimezone={financialTimezone}
      />

      <PayCyclePositionCard snapshot={snapshot} />

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
          Today&apos;s entries
        </h2>
        {entries.length === 0 ? (
          <p className="text-sm text-text-muted">No spends yet today.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex justify-between rounded-[14px] border border-border-subtle bg-paper px-4 py-3 text-sm"
              >
                <span className="tabular-nums font-medium text-text-strong">
                  {formatMoney(entry.amount_cents, snapshot.currency, {
                    wholeDollars: true,
                  })}
                </span>
                <span className="text-text-muted">{entry.category}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
