import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Partial<{ endpoint: string }>;
  if (!b.endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }
  const supabase = createServerClient();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", b.endpoint);
  if (error) {
    console.error("[push/unsubscribe]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
