"use client";

import { useEffect, useState, type FormEvent } from "react";
import { type Reminder } from "@/lib/reminders";
import { restoreReminder, permaDeleteReminder } from "@/app/actions";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ClientTime({ iso }: { iso: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning>{mounted ? formatDateTime(iso) : ""}</span>
  );
}

export default function TrashRemindersList({
  reminders,
}: {
  reminders: Reminder[];
}) {
  if (reminders.length === 0) {
    return (
      <p className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-surface)]/50 px-3 py-6 text-center text-sm text-[color:var(--color-ink-3)]">
        Nothing here.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {reminders.map((r) => (
        <li
          key={r.id}
          className="rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)]"
        >
          <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-wide text-[color:var(--color-ink-3)]">
            <span className="font-mono text-[color:var(--color-ink-2)]">
              #{r.number}
            </span>
            <span aria-hidden="true">·</span>
            <span className="normal-case tracking-normal">
              added <ClientTime iso={r.created_at} />
            </span>
            {r.deadline ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="normal-case tracking-normal">
                  due <ClientTime iso={r.deadline} />
                </span>
              </>
            ) : null}
            {r.deleted_at ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="normal-case tracking-normal text-[color:var(--color-ink-4)]">
                  deleted <ClientTime iso={r.deleted_at} />
                </span>
              </>
            ) : null}
          </div>
          <p className="mb-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[color:var(--color-ink-2)]">
            {r.content}
          </p>
          <div className="flex items-center gap-2">
            <form action={restoreReminder}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-2)] transition hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]"
              >
                Restore
              </button>
            </form>
            <form
              action={permaDeleteReminder}
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                if (
                  !window.confirm(
                    `Permanently delete reminder #${r.number}? This can't be undone.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded-[var(--radius-input)] border border-transparent px-3 py-1.5 text-xs font-medium text-[color:var(--color-danger)] transition hover:border-[color:var(--color-danger)]/30 hover:bg-[color:var(--color-danger)]/5"
              >
                Delete forever
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
