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

  const isoDeadline = deadlineLocal
    ? safeIsoFromLocal(deadlineLocal)
    : "";

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
    <form ref={formRef} action={formAction} className="mb-6">
      <textarea
        ref={textareaRef}
        name="content"
        rows={3}
        placeholder="What's the reminder? (⌘/Ctrl + Enter to save)"
        className="w-full resize-y rounded border border-neutral-300 bg-white p-3 text-base leading-snug focus:border-neutral-500 focus:outline-none"
        onKeyDown={onKeyDown}
      />

      <div className="mt-2">
        {showDeadline ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={deadlineLocal}
              onChange={(e) => setDeadlineLocal(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <input type="hidden" name="deadline" value={isoDeadline} />
            <button
              type="button"
              onClick={() => {
                setShowDeadline(false);
                setDeadlineLocal("");
              }}
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Remove
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDeadline(true)}
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
          >
            + Add deadline
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="min-h-[1.25rem] text-xs text-red-600">
          {state.error}
        </span>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function safeIsoFromLocal(local: string): string {
  const d = new Date(local);
  return isNaN(d.getTime()) ? "" : d.toISOString();
}
