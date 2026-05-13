"use client";

import {
  useActionState,
  useEffect,
  useRef,
  startTransition,
  type KeyboardEvent,
} from "react";
import { addIdea, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, error: "" };

export default function IdeaForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, pending] = useActionState(addIdea, initialState);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      textareaRef.current?.focus();
    }
  }, [state]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && formRef.current) {
      e.preventDefault();
      const fd = new FormData(formRef.current);
      startTransition(() => formAction(fd));
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mb-6 rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-3 shadow-[var(--shadow-sm)] transition focus-within:shadow-[var(--shadow-md)]"
    >
      <textarea
        ref={textareaRef}
        name="content"
        rows={3}
        placeholder="What just hit you? Capture it before it slips."
        className="w-full resize-y rounded-[var(--radius-input)] bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:outline-none"
        onKeyDown={onKeyDown}
      />
      <div className="mt-1 flex items-center justify-between gap-3">
        <span className="min-h-[1.25rem] text-xs text-[color:var(--color-danger)]">
          {state.error}
        </span>
        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] text-[color:var(--color-ink-4)] sm:inline">
            ⌘ + Enter to save
          </span>
          <button
            type="submit"
            disabled={pending}
            className="rounded-[var(--radius-input)] bg-[color:var(--color-accent)] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save idea"}
          </button>
        </div>
      </div>
    </form>
  );
}
