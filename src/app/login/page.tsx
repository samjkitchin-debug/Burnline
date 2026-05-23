import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/navigation/AppHeader";
import { authLog } from "@/lib/auth/log";
import { resolvePostAuthDestination } from "@/lib/auth/redirect";
import { getServerUserId } from "@/lib/auth/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next;

  const userId = await getServerUserId();
  if (userId) {
    authLog("login_page_with_auth_cookie", {
      route: next ? "has_next" : "default",
    });
    redirect(await resolvePostAuthDestination(next));
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-surface text-text-strong">
      <header className="border-b border-border-subtle bg-paper px-4 py-3">
        <AppHeader sectionLabel="Log in" showAppLinks />
      </header>
      <div className="flex flex-1 flex-col justify-center px-4 pb-8">
      <div className="mb-8 text-center">
        <p className="text-lg font-semibold text-brand-blue">
          One number for today. Beat it. Repeat tomorrow.
        </p>
      </div>

      <LoginForm next={next} />

      <p className="mt-6 text-center text-xs text-text-muted">
        By continuing you agree to use this app for personal budgeting only.
      </p>
      <p className="mt-4 text-center text-sm text-text-muted">
        <Link href="/privacy" className="text-brand-blue underline">
          Privacy
        </Link>
        {" · "}
        <Link href="/terms" className="text-brand-blue underline">
          Terms
        </Link>
      </p>
      </div>
    </div>
  );
}
