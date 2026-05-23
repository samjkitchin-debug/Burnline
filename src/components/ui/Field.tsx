export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-sm font-medium text-text-strong">
        {label}
      </span>
      {hint ? (
        <span className="mb-1.5 block text-xs text-text-muted">{hint}</span>
      ) : null}
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-h-12 rounded-xl border border-border-subtle bg-paper px-3 text-base text-text-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue";

export const selectClass = inputClass;
