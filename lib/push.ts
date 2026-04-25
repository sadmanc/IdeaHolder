import webpush, { type PushSubscription } from "web-push";
import { createServerClient } from "./supabase";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;
  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "Missing VAPID env vars: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT must all be set.",
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export type StoredSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushPayload = { title: string; body: string; url?: string };

export async function getAllSubscriptions(): Promise<StoredSubscription[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (error) {
    console.error("[getAllSubscriptions]", error.message);
    return [];
  }
  return (data ?? []) as StoredSubscription[];
}

async function deleteSubscription(id: string) {
  const supabase = createServerClient();
  await supabase.from("push_subscriptions").delete().eq("id", id);
}

export async function sendPush(
  sub: StoredSubscription,
  payload: PushPayload,
): Promise<{ ok: boolean; gone?: boolean; error?: string }> {
  ensureConfigured();
  const subscription: PushSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth },
  };
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { ok: true };
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 404 || status === 410) {
      await deleteSubscription(sub.id);
      return { ok: false, gone: true };
    }
    const message = e instanceof Error ? e.message : String(e);
    console.error("[sendPush]", status, message);
    return { ok: false, error: message };
  }
}

export async function broadcastPush(payload: PushPayload) {
  const subs = await getAllSubscriptions();
  return Promise.all(subs.map((s) => sendPush(s, payload)));
}
