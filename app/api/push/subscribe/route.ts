import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Partial<{
    endpoint: string;
    p256dh: string;
    auth: string;
    user_agent: string;
  }>;
  if (!b.endpoint || !b.p256dh || !b.auth) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      endpoint: b.endpoint,
      p256dh: b.p256dh,
      auth: b.auth,
      user_agent: b.user_agent ?? null,
    },
    { onConflict: "endpoint" },
  );
  if (error) {
    console.error("[push/subscribe]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
