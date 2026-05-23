import { AppHeader } from "@/components/navigation/AppHeader";
import { INFO_LAST_UPDATED } from "@/lib/navigation/infoLinks";

export function InfoPageLayout({
  title,
  children,
  lastUpdated = INFO_LAST_UPDATED,
}: {
  title: string;
  children: React.ReactNode;
  lastUpdated?: string;
}) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-surface text-text-strong">
      <header className="sticky top-0 z-20 border-b border-border-subtle bg-paper/95 px-5 py-3 shadow-[0_1px_0_var(--border-subtle)]">
        <AppHeader sectionLabel={title} showAppLinks />
      </header>
      <article className="px-5 py-6 pb-10">
        <p className="mb-6 text-xs text-text-muted">
          Last updated: {lastUpdated}
        </p>
        {children}
      </article>
    </div>
  );
}
