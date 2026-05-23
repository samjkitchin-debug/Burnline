"use client";

import { useActionState } from "react";
import {
  passwordAuthAction,
  type AuthActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/Button";
import { Field, inputClass } from "@/components/ui/Field";

const initialState: AuthActionState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(
    passwordAuthAction,
    initialState
  );

  return (
    <div className="rounded-[20px] border border-border-subtle bg-paper p-4 shadow-[var(--shadow-card)]">
      <form action={formAction} className="space-y-2">
        {next ? <input type="hidden" name="next" value={next} /> : null}
        <Field label="Email">
          <input
            className={inputClass}
            type="email"
            name="email"
            required
            autoComplete="email"
            disabled={pending}
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            name="password"
            required
            autoComplete={pending ? "off" : "current-password"}
            minLength={6}
            disabled={pending}
          />
        </Field>

        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            {state.error}
          </p>
        )}

        {state.message && (
          <p
            role="status"
            className="rounded-lg bg-positive-soft px-3 py-2 text-sm text-positive"
          >
            {state.message}
          </p>
        )}

        <Button type="submit" name="intent" value="login" disabled={pending}>
          {pending ? "Please wait…" : "Log in"}
        </Button>
        <Button
          type="submit"
          name="intent"
          value="signup"
          variant="secondary"
          disabled={pending}
        >
          {pending ? "Please wait…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
