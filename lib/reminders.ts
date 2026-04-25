export type Reminder = {
  id: string;
  number: number;
  content: string;
  deadline: string | null;
  created_at: string;
  completed_at: string | null;
  deleted_at: string | null;
  notified_day_before: boolean;
};

export const REMINDER_COLUMNS =
  "id, number, content, deadline, created_at, completed_at, deleted_at, notified_day_before";

export function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function relativeDeadline(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const overdue = diffMs < 0;
  const abs = Math.abs(diffMs);
  const min = Math.round(abs / 60_000);
  const hr = Math.round(abs / 3_600_000);
  const day = Math.round(abs / 86_400_000);
  let phrase: string;
  if (min < 1) phrase = "just now";
  else if (min < 60) phrase = `${min}m`;
  else if (hr < 24) phrase = `${hr}h`;
  else phrase = `${day}d`;
  return overdue ? `${phrase} overdue` : `in ${phrase}`;
}
