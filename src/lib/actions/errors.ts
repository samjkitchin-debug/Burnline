import { ZodError } from "zod";
import { MoneyParseError } from "@/lib/money/parseDollarsToCents";

export function isNextRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function toUserSafeActionError(error: unknown): string {
  if (error instanceof MoneyParseError) {
    return error.message;
  }
  if (error instanceof ZodError) {
    return "Please check your entries and try again.";
  }
  if (error instanceof Error && error.message === "Not authenticated") {
    return "Please log in and try again.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
