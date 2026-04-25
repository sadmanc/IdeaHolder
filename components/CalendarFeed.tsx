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
      <div className="rounded border border-neutral-200 bg-white p-3">
        <h3 className="text-sm font-medium text-neutral-900">Calendar feed</h3>
        <p className="mt-1 text-xs text-neutral-600">
          Set <code className="font-mono">CALENDAR_FEED_TOKEN</code> in your
          environment to enable the subscribable feed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded border border-neutral-200 bg-white p-3">
      <h3 className="text-sm font-medium text-neutral-900">Calendar feed</h3>
      <p className="mt-1 text-xs text-neutral-600">
        Subscribe to this URL in Apple Calendar (File → New Calendar
        Subscription) or Google Calendar (Other calendars → From URL). Reminders
        with deadlines appear as events.
      </p>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded border border-neutral-300 bg-neutral-50 px-2 py-1 font-mono text-xs text-neutral-700"
        />
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-500"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
