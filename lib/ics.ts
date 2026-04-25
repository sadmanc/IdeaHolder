import type { Reminder } from "./reminders";

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function toICSDate(iso: string): string {
  const d = new Date(iso);
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    "Z"
  );
}

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i === 0 ? 75 : i + 74);
    chunks.push(i === 0 ? chunk : " " + chunk);
    i += i === 0 ? 75 : 74;
  }
  return chunks.join("\r\n");
}

export function buildICS(reminders: Reminder[]): string {
  const now = toICSDate(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//IdeaHolder//Reminders//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "NAME:IdeaHolder Reminders",
    "X-WR-CALNAME:IdeaHolder Reminders",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];

  for (const r of reminders) {
    if (!r.deadline) continue;
    const start = new Date(r.deadline);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const summary = escapeText(`#${r.number} ${r.content}`.slice(0, 200));
    lines.push(
      "BEGIN:VEVENT",
      `UID:${r.id}@ideaholder`,
      `DTSTAMP:${now}`,
      `DTSTART:${toICSDate(start.toISOString())}`,
      `DTEND:${toICSDate(end.toISOString())}`,
      `SUMMARY:${summary}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "TRIGGER:-PT15M",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
