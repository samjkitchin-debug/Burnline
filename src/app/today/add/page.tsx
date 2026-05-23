import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { AddSpendForm } from "@/components/spend/AddSpendForm";
import { guardAuthenticatedAppRoute } from "@/lib/auth/guard";
import { loadBudgetSnapshot, loadProfileTimezone } from "@/lib/data/loadBudget";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AddSpendPage() {
  const { userId } = await guardAuthenticatedAppRoute("/today/add");

  const [{ snapshot }, financialTimezone] = await Promise.all([
    loadBudgetSnapshot(),
    loadProfileTimezone(userId),
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
    <AppShell activePath="/today" sectionLabel="Add spend">
      <Link
        href="/today"
        className="text-sm font-medium text-brand-blue hover:underline"
      >
        ← Back to today
      </Link>
      <div className="mt-4">
        <AddSpendForm
          mode="page"
          manualDailyTargetCents={snapshot.manualDailyTargetCents}
          billStreams={streams ?? []}
          financialTimezone={financialTimezone}
          autoFocusAmount
        />
      </div>
    </AppShell>
  );
}
