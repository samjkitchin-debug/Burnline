export function InfoTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-2 text-2xl font-bold text-brand-blue">{children}</h1>
  );
}

export function InfoLead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-6 text-base leading-relaxed text-text-strong">{children}</p>
  );
}

export function InfoH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 mt-8 text-lg font-semibold text-brand-blue first:mt-0">
      {children}
    </h2>
  );
}

export function InfoP({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-sm leading-relaxed text-text-strong">{children}</p>
  );
}

export function InfoUl({ children }: { children: React.ReactNode }) {
  return (
    <ul className="mb-4 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-text-strong">
      {children}
    </ul>
  );
}
