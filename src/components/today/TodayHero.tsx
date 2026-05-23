import { formatMoney } from "@/lib/budget/formatMoney";
import type { BudgetSnapshot } from "@/lib/budget/types";
import { todayHeroCopy } from "@/lib/copy/budgetCopy";

function WhyLineDisclosure({ snapshot }: { snapshot: BudgetSnapshot }) {
  const lineLabel = formatMoney(
    snapshot.maxTodayDisplayCents,
    snapshot.currency,
    { wholeDollars: true }
  );

  const fixedLabel = formatMoney(snapshot.fixedDailyBurnCents, snapshot.currency, {
    wholeDollars: true,
  });
  const extraLabel = formatMoney(
    snapshot.manualDailyTargetCents,
    snapshot.currency,
    { wholeDollars: true }
  );
  const savingsLabel = formatMoney(
    snapshot.dailySavingsTargetCents,
    snapshot.currency,
    { wholeDollars: true }
  );

  return (
    <details className="group mt-3">
      <summary
        className="flex min-h-10 w-full cursor-pointer list-none items-center justify-center gap-1 rounded-b-[20px] px-5 py-2 text-xs font-medium leading-none text-text-muted transition-[color,background-color] duration-150 hover:bg-black/[0.02] hover:text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue group-open:rounded-b-none group-open:hover:bg-transparent [&::-webkit-details-marker]:hidden"
        aria-label={`Why is today's line ${lineLabel}?`}
      >
        <span className="select-none">Why {lineLabel}?</span>
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center text-text-muted transition-transform duration-200 group-open:rotate-180"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="block"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="rounded-b-[20px] px-5 pb-4 pt-3">
        <ul className="space-y-1.5 text-[13px]">
          <li className="flex items-baseline justify-between gap-4 text-text-strong">
            <span>Fixed costs</span>
            <span className="shrink-0 tabular-nums">{fixedLabel}</span>
          </li>
          <li className="flex items-baseline justify-between gap-4 text-text-strong">
            <span>Extra you can spend</span>
            <span className="shrink-0 tabular-nums">{extraLabel}</span>
          </li>
          <li className="flex items-baseline justify-between gap-4 border-t border-border-subtle pt-2 font-medium text-text-strong">
            <span>Today&apos;s line</span>
            <span className="shrink-0 tabular-nums">{lineLabel}</span>
          </li>
        </ul>
        <p className="mt-2.5 flex items-baseline justify-between gap-4 text-[13px] text-text-muted">
          <span>Savings protected</span>
          <span className="shrink-0 tabular-nums">{savingsLabel}</span>
        </p>
        <p className="mt-2.5 text-[13px] leading-snug text-text-muted">
          Stay under today&apos;s line to protect your savings goal.
        </p>
      </div>
    </details>
  );
}

export function TodayHero({ snapshot }: { snapshot: BudgetSnapshot }) {
  const hero = todayHeroCopy(snapshot);
  const progressPct =
    snapshot.maxTodayCents > 0
      ? Math.min(100, (snapshot.spentTodayCents / snapshot.maxTodayCents) * 100)
      : 0;

  return (
    <section
      className={`overflow-hidden rounded-[20px] border border-border-subtle bg-paper shadow-[var(--shadow-card)] ${
        hero.isOver ? "ring-1 ring-danger/20" : ""
      }`}
      aria-label="Today spend summary"
    >
      <div className="p-5">
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <p className="tabular-nums text-4xl font-bold tracking-tight text-brand-blue">
              {hero.spentLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-text-muted">Spent today</p>
          </div>
          <div>
            <p className="tabular-nums text-4xl font-bold tracking-tight text-accent-gold">
              {hero.lineLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-text-muted">
              Today&apos;s line
            </p>
          </div>
        </div>

        <div className="mt-5" aria-hidden>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-brand-blue-soft">
            <div
              className={`h-full rounded-full transition-[width] ${
                hero.isOver ? "bg-danger" : "bg-brand-blue"
              }`}
              style={{ width: `${progressPct}%` }}
            />
            <div
              className="absolute top-0 right-0 h-full w-0.5 bg-accent-gold"
              title="Today's line"
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-medium text-text-muted">
            <span>$0</span>
            <span className="text-accent-gold">Line</span>
          </div>
        </div>

        <p
          className={`mt-4 rounded-xl px-3 py-2 text-center text-sm font-medium tabular-nums ${
            hero.isOver
              ? "bg-danger-soft text-danger"
              : "bg-positive-soft text-positive"
          }`}
          role="status"
        >
          <span className="sr-only">
            {hero.isOver ? "Over line: " : "Under line: "}
          </span>
          {hero.subline}
        </p>
      </div>

      <WhyLineDisclosure snapshot={snapshot} />
    </section>
  );
}
