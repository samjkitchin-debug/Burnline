import { redirect } from "next/navigation";
import { loginPath, resolvePostAuthDestination } from "@/lib/auth/redirect";
import { getServerUserId } from "@/lib/auth/server";

export default async function HomePage() {
  const userId = await getServerUserId();

  if (!userId) {
    redirect(loginPath("/today"));
  }

  redirect(await resolvePostAuthDestination("/today"));
}
