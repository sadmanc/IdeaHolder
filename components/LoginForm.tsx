"use client";

import { useActionState } from "react";
import { login, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input
        type="password"
        name="password"
        autoFocus
        autoComplete="current-password"
        placeholder="Password"
        className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 py-2.5 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] shadow-[var(--shadow-sm)] focus:outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[var(--radius-input)] bg-[color:var(--color-accent)] px-3 py-2.5 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-50"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
      {state.error ? (
        <p className="text-sm text-[color:var(--color-danger)]">{state.error}</p>
      ) : null}
    </form>
  );
}
