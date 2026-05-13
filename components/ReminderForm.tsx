"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  startTransition,
  type KeyboardEvent,
} from "react";
import { addReminder, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, error: "" };

export default function ReminderForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [state, formAction, pending] = useActionState(addReminder, initialState);
  const [showDeadline, setShowDeadline] = useState(false);
  const [deadlineLocal, setDeadlineLocal] = useState("");

  const isoDeadline = deadlineLocal ? safeIsoFromLocal(deadlineLocal) : "";

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setDeadlineLocal("");
      setShowDeadline(false);
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
        placeholder="What should you not forget?"
        className="w-full resize-y rounded-[var(--radius-input)] bg-transparent px-2 py-1.5 text-[15px] leading-relaxed text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] focus:outline-none"
        onKeyDown={onKeyDown}
      />

      <div className="mt-2 flex items-center gap-2 text-xs">
        {showDeadline ? (
          <>
            <input
              type="datetime-local"
              value={deadlineLocal}
              onChange={(e) => setDeadlineLocal(e.target.value)}
              className="rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-2 py-1 text-sm text-[color:var(--color-ink)] focus:outline-none"
            />
            <input type="hidden" name="deadline" value={isoDeadline} />
            <button
              type="button"
              onClick={() => {
                setShowDeadline(false);
                setDeadlineLocal("");
              }}
              className="text-[color:var(--color-ink-3)] transition hover:text-[color:var(--color-ink)]"
            >
              Remove deadline
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeadline(true)}
            className="text-[color:var(--color-ink-3)] transition hover:text-[color:var(--color-ink)]"
          >
            + Add deadline
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
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
            {pending ? "Saving…" : "Save reminder"}
          </button>
        </div>
      </div>
    </form>
  );
}

function safeIsoFromLocal(local: string): string {
  const d = new Date(local);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
