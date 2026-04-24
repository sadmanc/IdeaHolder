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
    <form ref={formRef} action={formAction} className="mb-6">
      <textarea
        ref={textareaRef}
        name="content"
        rows={3}
        placeholder="What's the idea? (⌘/Ctrl + Enter to save)"
        className="w-full resize-y rounded border border-neutral-300 bg-white p-3 text-base leading-snug focus:border-neutral-500 focus:outline-none"
        onKeyDown={onKeyDown}
      />
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
