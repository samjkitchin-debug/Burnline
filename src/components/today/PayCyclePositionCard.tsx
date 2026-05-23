import { payCyclePositionCopy } from "@/lib/copy/budgetCopy";
import type { BudgetSnapshot } from "@/lib/budget/types";

export function PayCyclePositionCard({
  snapshot,
}: {
  snapshot: BudgetSnapshot;
}) {
  const position = payCyclePositionCopy(snapshot);
  const completion = snapshot.cycleCompletion;

  return (
    <>
      {completion ? (
        <section className="rounded-[20px] border border-accent-gold/40 bg-accent-gold-soft/50 p-5 shadow-[var(--shadow-card)]">
          <h2 className="text-sm font-bold text-brand-blue">{completion.title}</h2>
          <p className="mt-2 text-base font-semibold text-text-strong">
            {completion.headline}
          </p>
          <p className="mt-1 text-sm text-text-muted">{completion.subline}</p>
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-[14px] border border-border-subtle bg-paper px-4 py-3 text-sm font-semibold text-text-muted"
            title="Coming soon — records cycle completion in a future release"
          >
            Mark cycle complete
          </button>
        </section>
      ) : null}

      <section
        className={`rounded-[20px] border border-border-subtle bg-paper p-5 shadow-[var(--shadow-card)] ${
          position.showTrackingPlaceholder ? "opacity-95" : ""
        }`}
      >
        <h2 className="text-sm font-bold text-brand-blue">{position.title}</h2>

        {position.showTrackingPlaceholder ? (
          <>
            <p className="mt-2 text-base font-semibold text-text-muted">
              {position.headline}
            </p>
            <p className="mt-1 text-sm text-text-muted">{position.subline}</p>
          </>
        ) : (
          <>
            <p
              className={`mt-2 tabular-nums text-xl font-bold ${
                position.isOver ? "text-danger" : "text-positive"
              }`}
              role="status"
            >
              <span className="sr-only">
                {position.isOver ? "Over the line: " : "Under the line: "}
              </span>
              {position.headline}
            </p>
            {position.daysLeftLabel ? (
              <p className="mt-0.5 text-sm font-medium text-text-muted">
                {position.daysLeftLabel}
              </p>
            ) : null}
            <p className="mt-2 text-sm text-text-muted">{position.subline}</p>
            {position.yearLine ? (
              <p className="mt-3 border-t border-border-subtle pt-3 text-xs text-text-muted">
                {position.yearLine}
                <span className="mt-0.5 block">Measured from tracked days.</span>
              </p>
            ) : null}
          </>
        )}
      </section>
    </>
  );
}
