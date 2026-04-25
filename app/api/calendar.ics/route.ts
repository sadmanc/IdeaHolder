import { type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";
import { buildICS } from "@/lib/ics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const expected = process.env.CALENDAR_FEED_TOKEN;
  if (!expected) {
    return new Response("Calendar feed disabled.", { status: 503 });
  }
  const token = req.nextUrl.searchParams.get("token");
  if (token !== expected) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("reminders")
    .select(REMINDER_COLUMNS)
    .is("deleted_at", null)
    .is("completed_at", null)
    .not("deadline", "is", null);

  if (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  const ics = buildICS((data ?? []) as Reminder[]);
  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": 'inline; filename="ideaholder.ics"',
    },
  });
}
