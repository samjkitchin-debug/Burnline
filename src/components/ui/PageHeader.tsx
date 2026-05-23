export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-4">
      <p className="text-sm font-semibold tracking-wide text-brand-blue">
        {title}
      </p>
      {subtitle ? (
        <p className="mt-0.5 text-xs font-medium text-text-muted">{subtitle}</p>
      ) : null}
    </header>
  );
}
