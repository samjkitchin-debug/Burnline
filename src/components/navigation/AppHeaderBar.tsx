import { HamburgerMenu } from "@/components/navigation/HamburgerMenu";

export function AppHeaderBar({
  sectionLabel,
  showAppLinks = false,
  isSignedIn = false,
}: {
  sectionLabel: string;
  showAppLinks?: boolean;
  isSignedIn?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-bold tracking-wide text-brand-blue">
          Burnline
        </p>
        <p className="mt-0.5 truncate text-xs font-medium text-text-muted">
          {sectionLabel}
        </p>
      </div>
      <HamburgerMenu showAppLinks={showAppLinks} isSignedIn={isSignedIn} />
    </div>
  );
}
