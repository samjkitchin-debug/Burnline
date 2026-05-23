import Link from "next/link";
import { AppHeader } from "@/components/navigation/AppHeader";

const SECTION_LABELS: Record<string, string> = {
  "/today": "Today",
  "/fixed-costs": "Fixed costs",
  "/settings": "Settings",
};

const nav = [
  { href: "/today", label: "Today" },
  { href: "/fixed-costs", label: "Fixed costs" },
  { href: "/settings", label: "Settings" },
] as const;

const navLinkBase =
  "flex w-full min-h-11 items-center justify-center rounded-full px-3 py-2 text-sm font-medium transition-[color,background-color,box-shadow,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-nav-surface";

export function AppShell({
  children,
  activePath,
  sectionLabel,
}: {
  children: React.ReactNode;
  activePath: string;
  sectionLabel?: string;
}) {
  const label = sectionLabel ?? SECTION_LABELS[activePath] ?? "Burnline";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-surface text-text-strong">
      <main
        className="flex flex-1 flex-col gap-4 px-5 pt-5 pb-[calc(4.75rem+max(0.75rem,env(safe-area-inset-bottom,0px)))]"
        style={{ gap: "var(--space-card-gap)" }}
      >
        <AppHeader sectionLabel={label} />
        {children}
      </main>
      <nav
        className="fixed bottom-0 left-0 right-0 z-10 mx-auto max-w-md border-t border-[var(--nav-border)] bg-nav-surface shadow-[var(--nav-shadow)]"
        style={{
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Main"
      >
        <ul className="flex min-h-16 items-center gap-1.5 px-3.5 py-2">
          {nav.map((item) => {
            const active = activePath === item.href;
            return (
              <li key={item.href} className="flex min-w-0 flex-1">
                <Link
                  href={item.href}
                  className={
                    active
                      ? `${navLinkBase} border border-accent-gold/30 bg-nav-active-bg font-semibold text-nav-active-text shadow-[0_1px_3px_rgb(15_39_68_/10%)]`
                      : `${navLinkBase} border border-transparent text-nav-inactive-text hover:bg-brand-blue-soft/70 hover:text-text-strong`
                  }
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
