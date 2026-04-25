"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  type Reminder,
  formatDeadline,
  relativeDeadline,
} from "@/lib/reminders";
import {
  completeReminder,
  uncompleteReminder,
  deleteReminder,
  updateReminder,
  type ActionState,
} from "@/app/actions";

const initialState: ActionState = { ok: false, error: "" };

function ClientTime({ iso }: { iso: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning>
      {mounted ? formatDeadline(iso) : ""}
    </span>
  );
}

function ClientRelative({ iso }: { iso: string }) {
  const [mounted, setMounted] = useState(false);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!mounted) return <span suppressHydrationWarning />;
  const overdue = new Date(iso).getTime() < Date.now();
  return (
    <span
      suppressHydrationWarning
      className={overdue ? "text-red-600" : "text-neutral-500"}
      data-tick={tick}
    >
      {relativeDeadline(iso)}
    </span>
  );
}

function isoToLocalInput(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    "T" +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes())
  );
}

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const [editing, setEditing] = useState(false);
  const completed = reminder.completed_at !== null;

  return (
    <li className="py-4">
      {editing ? (
        <EditForm reminder={reminder} onDone={() => setEditing(false)} />
      ) : (
        <>
          <div className="mb-1 flex items-baseline gap-3 text-xs text-neutral-500">
            <span className="font-mono font-medium text-neutral-700">
              #{reminder.number}
            </span>
            {reminder.deadline ? (
              <>
                <span className={completed ? "" : ""}>
                  Due <ClientTime iso={reminder.deadline} />
                </span>
                {!completed && (
                  <span aria-hidden="true" className="text-neutral-300">
                    ·
                  </span>
                )}
                {!completed && <ClientRelative iso={reminder.deadline} />}
              </>
            ) : (
              <span className="text-neutral-400">No deadline</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              {completed ? (
                <form action={uncompleteReminder}>
                  <input type="hidden" name="id" value={reminder.id} />
                  <button
                    type="submit"
                    aria-label={`Uncomplete reminder #${reminder.number}`}
                    className="text-xs text-neutral-400 transition-colors hover:text-neutral-700"
                  >
                    Undo
                  </button>
                </form>
              ) : (
                <form action={completeReminder}>
                  <input type="hidden" name="id" value={reminder.id} />
                  <button
                    type="submit"
                    aria-label={`Complete reminder #${reminder.number}`}
                    className="leading-none text-neutral-400 transition-colors hover:text-green-600"
                    title="Mark complete"
                  >
                    <span aria-hidden="true" className="text-base">
                      ✓
                    </span>
                  </button>
                </form>
              )}
              {!completed && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={`Edit reminder #${reminder.number}`}
                  className="leading-none text-neutral-400 transition-colors hover:text-neutral-900"
                  title="Edit"
                >
                  <span aria-hidden="true" className="text-sm">
                    ✎
                  </span>
                </button>
              )}
              <form
                action={deleteReminder}
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  if (
                    !window.confirm(`Delete reminder #${reminder.number}?`)
                  ) {
                    e.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="id" value={reminder.id} />
                <button
                  type="submit"
                  aria-label={`Delete reminder #${reminder.number}`}
                  className="leading-none text-neutral-400 transition-colors hover:text-red-600"
                  title="Delete"
                >
                  <span aria-hidden="true" className="text-base">
                    ×
                  </span>
                </button>
              </form>
            </div>
          </div>
          <p
            className={
              "whitespace-pre-wrap break-words text-[15px] leading-relaxed " +
              (completed
                ? "text-neutral-400 line-through"
                : "text-neutral-900")
            }
          >
            {reminder.content}
          </p>
        </>
      )}
    </li>
  );
}

function EditForm({
  reminder,
  onDone,
}: {
  reminder: Reminder;
  onDone: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    updateReminder,
    initialState,
  );
  const [content, setContent] = useState(reminder.content);
  const [hasDeadline, setHasDeadline] = useState(reminder.deadline !== null);
  const [deadlineLocal, setDeadlineLocal] = useState(
    reminder.deadline ? isoToLocalInput(reminder.deadline) : "",
  );

  const iso = hasDeadline && deadlineLocal
    ? new Date(deadlineLocal).toISOString()
    : "";

  useEffect(() => {
    if (state.ok) onDone();
  }, [state, onDone]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="id" value={reminder.id} />
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full resize-y rounded border border-neutral-300 bg-white p-2 text-[15px] focus:border-neutral-500 focus:outline-none"
      />
      <div className="flex items-center gap-2 text-xs">
        {hasDeadline ? (
          <>
            <input
              type="datetime-local"
              value={deadlineLocal}
              onChange={(e) => setDeadlineLocal(e.target.value)}
              className="rounded border border-neutral-300 bg-white px-2 py-1 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <input type="hidden" name="deadline" value={iso} />
            <button
              type="button"
              onClick={() => {
                setHasDeadline(false);
                setDeadlineLocal("");
              }}
              className="text-neutral-500 transition-colors hover:text-neutral-900"
            >
              Remove deadline
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setHasDeadline(true)}
            className="text-neutral-500 transition-colors hover:text-neutral-900"
          >
            + Add deadline
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
        >
          Cancel
        </button>
        {state.error && (
          <span className="text-xs text-red-600">{state.error}</span>
        )}
      </div>
    </form>
  );
}

function sortActive(reminders: Reminder[]): Reminder[] {
  const withDeadline = reminders
    .filter((r) => r.deadline !== null)
    .sort((a, b) => (a.deadline! < b.deadline! ? -1 : 1));
  const without = reminders
    .filter((r) => r.deadline === null)
    .sort((a, b) => b.number - a.number);
  return [...withDeadline, ...without];
}

export default function ReminderList({ reminders }: { reminders: Reminder[] }) {
  const [q, setQ] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  const active = useMemo(
    () => sortActive(reminders.filter((r) => r.completed_at === null)),
    [reminders],
  );
  const completed = useMemo(
    () =>
      reminders
        .filter((r) => r.completed_at !== null)
        .sort((a, b) => (a.completed_at! < b.completed_at! ? 1 : -1)),
    [reminders],
  );

  const filteredActive = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return active;
    return active.filter(
      (r) =>
        r.content.toLowerCase().includes(query) ||
        `#${r.number}`.includes(query) ||
        String(r.number).includes(query),
    );
  }, [q, active]);

  return (
    <section>
      <div className="sticky top-0 z-10 -mx-5 bg-[color:var(--color-canvas)]/90 px-5 py-2 backdrop-blur">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            active.length
              ? `Search ${active.length} reminder${active.length === 1 ? "" : "s"}…`
              : "Search…"
          }
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-base focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {filteredActive.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          {active.length === 0
            ? "No reminders yet. Add one above."
            : "No matches."}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {filteredActive.map((r) => (
            <ReminderRow key={r.id} reminder={r} />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <div className="mt-6 border-t border-neutral-200 pt-3">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-neutral-900"
          >
            <span>{showCompleted ? "▾" : "▸"}</span>
            <span>Completed ({completed.length})</span>
          </button>
          {showCompleted && (
            <ul className="mt-2 divide-y divide-neutral-200">
              {completed.map((r) => (
                <ReminderRow key={r.id} reminder={r} />
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
