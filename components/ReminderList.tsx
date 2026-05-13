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
    <span suppressHydrationWarning>{mounted ? formatDeadline(iso) : ""}</span>
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
      className={
        overdue
          ? "font-medium text-[color:var(--color-danger)]"
          : "text-[color:var(--color-ink-3)]"
      }
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
    <li
      className={
        "group animate-in rounded-[var(--radius-card)] border bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition hover:shadow-[var(--shadow-md)] " +
        (completed
          ? "border-[color:var(--color-line)] opacity-70"
          : "border-[color:var(--color-line)] hover:border-[color:var(--color-line-strong)]")
      }
    >
      {editing ? (
        <EditForm reminder={reminder} onDone={() => setEditing(false)} />
      ) : (
        <>
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wide text-[color:var(--color-ink-3)]">
            <span className="font-mono text-[color:var(--color-accent)]">
              #{reminder.number}
            </span>
            {reminder.deadline ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="normal-case tracking-normal">
                  Due <ClientTime iso={reminder.deadline} />
                </span>
                {!completed && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="normal-case tracking-normal">
                      <ClientRelative iso={reminder.deadline} />
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span aria-hidden="true">·</span>
                <span className="normal-case tracking-normal text-[color:var(--color-ink-4)]">
                  No deadline
                </span>
              </>
            )}
            <div className="ml-auto flex items-center gap-1">
              {completed ? (
                <form action={uncompleteReminder}>
                  <input type="hidden" name="id" value={reminder.id} />
                  <button
                    type="submit"
                    aria-label={`Uncomplete reminder #${reminder.number}`}
                    className="rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-ink-3)] transition hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]"
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
                    title="Mark complete"
                    className="rounded-md p-1 leading-none text-[color:var(--color-ink-4)] transition hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-success)]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m3 8 3.5 3.5L13 5" />
                    </svg>
                  </button>
                </form>
              )}
              {!completed && (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  aria-label={`Edit reminder #${reminder.number}`}
                  title="Edit"
                  className="rounded-md p-1 leading-none text-[color:var(--color-ink-4)] opacity-0 transition group-hover:opacity-100 hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)] focus:opacity-100"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 2 2 2-9 9-3 1 1-3z" />
                  </svg>
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
                  title="Delete"
                  className="rounded-md p-1 leading-none text-[color:var(--color-ink-4)] opacity-0 transition group-hover:opacity-100 hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-danger)] focus:opacity-100"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M3 3l10 10M13 3 3 13" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
          <p
            className={
              "whitespace-pre-wrap break-words text-[15px] leading-relaxed " +
              (completed
                ? "text-[color:var(--color-ink-3)] line-through"
                : "text-[color:var(--color-ink)]")
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
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={reminder.id} />
      <textarea
        name="content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full resize-y rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-2 text-[15px] text-[color:var(--color-ink)] focus:outline-none"
      />
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {hasDeadline ? (
          <>
            <input
              type="datetime-local"
              value={deadlineLocal}
              onChange={(e) => setDeadlineLocal(e.target.value)}
              className="rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-2 py-1 text-sm text-[color:var(--color-ink)] focus:outline-none"
            />
            <input type="hidden" name="deadline" value={iso} />
            <button
              type="button"
              onClick={() => {
                setHasDeadline(false);
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
            onClick={() => setHasDeadline(true)}
            className="text-[color:var(--color-ink-3)] transition hover:text-[color:var(--color-ink)]"
          >
            + Add deadline
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-[var(--radius-input)] bg-[color:var(--color-accent)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[color:var(--color-accent-hover)] disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="text-xs text-[color:var(--color-ink-3)] transition hover:text-[color:var(--color-ink)]"
        >
          Cancel
        </button>
        {state.error && (
          <span className="text-xs text-[color:var(--color-danger)]">
            {state.error}
          </span>
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
      <div className="sticky top-0 z-10 -mx-5 mb-3 bg-[color:var(--color-canvas)]/85 px-5 py-2 backdrop-blur">
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-4)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              active.length
                ? `Search ${active.length} reminder${active.length === 1 ? "" : "s"} or #number`
                : "Search…"
            }
            className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] py-2 pl-9 pr-3 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] shadow-[var(--shadow-sm)] transition focus:outline-none"
          />
        </div>
      </div>

      {filteredActive.length === 0 ? (
        active.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)]/50 p-8 text-center">
            <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-ink)]">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="13" r="8" />
                <path d="M12 9v4l2.5 2.5M8 3.5 5 5M16 3.5l3 1.5" />
              </svg>
            </div>
            <p className="text-[15px] font-medium text-[color:var(--color-ink)]">
              No active reminders.
            </p>
            <p className="mt-1 text-sm text-[color:var(--color-ink-3)]">
              Add one with an optional deadline. The 9 AM daily digest and the
              24-hour pre-alarm will keep things in view.
            </p>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-[color:var(--color-ink-3)]">
            No matches.
          </p>
        )
      ) : (
        <ul className="space-y-2">
          {filteredActive.map((r) => (
            <ReminderRow key={r.id} reminder={r} />
          ))}
        </ul>
      )}

      {completed.length > 0 && (
        <div className="mt-8 border-t border-[color:var(--color-line)] pt-4">
          <button
            type="button"
            onClick={() => setShowCompleted((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-xs font-medium text-[color:var(--color-ink-3)] transition hover:text-[color:var(--color-ink)]"
          >
            <span
              aria-hidden="true"
              className={
                "inline-block transition-transform " +
                (showCompleted ? "rotate-90" : "")
              }
            >
              ▸
            </span>
            <span>Completed</span>
            <span className="text-[color:var(--color-ink-4)]">
              ({completed.length})
            </span>
          </button>
          {showCompleted && (
            <ul className="mt-3 space-y-2">
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
