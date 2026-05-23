type PublicEnvKey =
  | "NEXT_PUBLIC_SUPABASE_URL"
  | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function missingEnvMessage(name: PublicEnvKey): string {
  return (
    `Missing ${name}. Copy .env.example to .env.local and set your Supabase ` +
    `project URL and anon key (project ref huptejlrdmbkwuxmaejm).`
  );
}

export function requirePublicEnv(name: PublicEnvKey): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(missingEnvMessage(name));
  }
  return value;
}
