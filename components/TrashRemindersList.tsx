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
      <p className="py-6 text-sm text-neutral-500">No deleted reminders.</p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {reminders.map((r) => (
        <li key={r.id} className="py-4">
          <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="font-mono font-medium text-neutral-700">
              #{r.number}
            </span>
            <span>
              added <ClientTime iso={r.created_at} />
            </span>
            {r.deadline ? (
              <span>
                · due <ClientTime iso={r.deadline} />
              </span>
            ) : null}
            {r.deleted_at ? (
              <span className="text-neutral-400">
                · deleted <ClientTime iso={r.deleted_at} />
              </span>
            ) : null}
          </div>
          <p className="mb-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-neutral-700">
            {r.content}
          </p>
          <div className="flex items-center gap-2">
            <form action={restoreReminder}>
              <input type="hidden" name="id" value={r.id} />
              <button
                type="submit"
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-500"
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
                className="rounded border border-transparent px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
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
