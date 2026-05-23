import { AppHeaderBar } from "@/components/navigation/AppHeaderBar";
import { getServerUserId } from "@/lib/auth/server";

export async function AppHeader({
  sectionLabel,
  showAppLinks = false,
}: {
  sectionLabel: string;
  showAppLinks?: boolean;
}) {
  const userId = await getServerUserId();

  return (
    <AppHeaderBar
      sectionLabel={sectionLabel}
      showAppLinks={showAppLinks}
      isSignedIn={Boolean(userId)}
    />
  );
}
