import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import {
  broadcastPush,
  getAllSubscriptions,
  sendPush,
} from "@/lib/push";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";

function torontoTime(now: Date): { hh: number; mm: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Toronto",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { hh, mm };
}

function formatTorontoDeadline(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Toronto",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

async function handle(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET not set" },
      { status: 503 },
    );
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${expected}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const { hh, mm } = torontoTime(now);
  const supabase = createServerClient();

  const result = {
    torontoTime: `${hh.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`,
    dailyDigest: false,
    dailyDigestRecipients: 0,
    dayBeforeFired: 0,
  };

  if (hh === 9 && mm < 15) {
    result.dailyDigest = true;
    const { data, error } = await supabase
      .from("reminders")
      .select(REMINDER_COLUMNS)
      .is("completed_at", null)
      .is("deleted_at", null);
    if (error) {
      console.error("[cron/notify] daily fetch", error.message);
    } else {
      const incomplete = (data ?? []) as Reminder[];
      if (incomplete.length > 0) {
        const overdue = incomplete.filter(
          (r) => r.deadline && new Date(r.deadline) < now,
        );
        const sample = incomplete
          .slice(0, 3)
          .map((r) => r.content.split("\n")[0])
          .join(", ");
        const title = `${incomplete.length} reminder${incomplete.length === 1 ? "" : "s"} today`;
        const body =
          overdue.length > 0 ? `${overdue.length} overdue · ${sample}` : sample;
        const responses = await broadcastPush({
          title,
          body,
          url: "/reminders",
        });
        result.dailyDigestRecipients = responses.length;
      }
    }
  }

  const horizon = new Date(now.getTime() + 24 * 3600 * 1000);
  const { data: upcoming, error: upErr } = await supabase
    .from("reminders")
    .select(REMINDER_COLUMNS)
    .is("completed_at", null)
    .is("deleted_at", null)
    .eq("notified_day_before", false)
    .gte("deadline", now.toISOString())
    .lte("deadline", horizon.toISOString());

  if (upErr) {
    console.error("[cron/notify] upcoming fetch", upErr.message);
  } else {
    const list = (upcoming ?? []) as Reminder[];
    if (list.length > 0) {
      const subs = await getAllSubscriptions();
      for (const r of list) {
        await Promise.all(
          subs.map((s) =>
            sendPush(s, {
              title: `⚠️ Due tomorrow: ${r.content.split("\n")[0].slice(0, 80)}`,
              body: r.deadline
                ? `Deadline ${formatTorontoDeadline(r.deadline)}`
                : "",
              url: "/reminders",
            }),
          ),
        );
        await supabase
          .from("reminders")
          .update({ notified_day_before: true })
          .eq("id", r.id);
      }
      result.dayBeforeFired = list.length;
    }
  }

  return NextResponse.json({ ok: true, ...result });
}

export async function POST(req: NextRequest) {
  return handle(req);
}

export async function GET(req: NextRequest) {
  return handle(req);
}
