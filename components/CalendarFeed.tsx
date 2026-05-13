"use client";

import { useEffect, useState } from "react";

export default function CalendarFeed({ token }: { token: string }) {
  const [url, setUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!token) {
      setUrl("");
      return;
    }
    setUrl(`${window.location.origin}/api/calendar.ics?token=${token}`);
  }, [token]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // fallback: select the input
    }
  }

  if (!token) {
    return (
      <div className="rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
        <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
          Calendar feed
        </h3>
        <p className="mt-1.5 text-xs text-[color:var(--color-ink-2)]">
          Set{" "}
          <code className="rounded bg-[color:var(--color-surface-2)] px-1 py-0.5 font-mono text-[11px]">
            CALENDAR_FEED_TOKEN
          </code>{" "}
          in your environment to enable the subscribable feed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      <h3 className="text-sm font-semibold text-[color:var(--color-ink)]">
        Calendar feed
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--color-ink-2)]">
        Subscribe to this URL in Apple Calendar (File → New Calendar
        Subscription) or Google Calendar (Other calendars → From URL).
        Reminders with deadlines appear as events.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface-2)] px-2 py-1.5 font-mono text-[11px] text-[color:var(--color-ink-2)] focus:outline-none"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-ink-2)] transition hover:border-[color:var(--color-line-strong)] hover:text-[color:var(--color-ink)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-[color:var(--color-ink-4)]">
        Treat the URL like a password — anyone with it can read your
        reminders.
      </p>
    </div>
  );
}
