export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-border-subtle bg-paper p-5 shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </section>
  );
}
