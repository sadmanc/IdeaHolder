"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import {
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { broadcastPush } from "@/lib/push";

export type ActionState = { ok: boolean; error: string };

function parseDeadline(formData: FormData): string | null | { error: string } {
  const raw = formData.get("deadline");
  if (typeof raw !== "string" || !raw.trim()) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return { error: "Invalid deadline." };
  return d.toISOString();
}

export async function addIdea(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formData.get("content");
  const content = typeof raw === "string" ? raw.trim() : "";
  if (!content) return { ok: false, error: "Idea can't be empty." };
  if (content.length > 10_000) {
    return { ok: false, error: "Idea is too long (max 10,000 chars)." };
  }
  const supabase = createServerClient();
  const { error } = await supabase.from("ideas").insert({ content });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/ideas");
  return { ok: true, error: "" };
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formData.get("password");
  const password = typeof raw === "string" ? raw : "";
  if (!password) return { ok: false, error: "Enter a password." };
  let matched = false;
  try {
    matched = await verifyPassword(password);
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Server misconfigured.",
    };
  }
  if (!matched) return { ok: false, error: "Wrong password." };
  await setSessionCookie();
  redirect("/ideas");
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

export async function deleteIdea(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("ideas")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[deleteIdea]", error.message);
  revalidatePath("/ideas");
  revalidatePath("/trash");
}

export async function restoreIdea(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("ideas")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) console.error("[restoreIdea]", error.message);
  revalidatePath("/ideas");
  revalidatePath("/trash");
}

export async function permaDeleteIdea(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase.from("ideas").delete().eq("id", id);
  if (error) console.error("[permaDeleteIdea]", error.message);
  revalidatePath("/trash");
}

export async function addReminder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const raw = formData.get("content");
  const content = typeof raw === "string" ? raw.trim() : "";
  if (!content) return { ok: false, error: "Reminder can't be empty." };
  if (content.length > 10_000) {
    return { ok: false, error: "Too long (max 10,000 chars)." };
  }
  const parsed = parseDeadline(formData);
  if (parsed && typeof parsed === "object") return { ok: false, error: parsed.error };
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reminders")
    .insert({ content, deadline: parsed });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/reminders");
  return { ok: true, error: "" };
}

export async function updateReminder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id");
  const id = typeof idRaw === "string" ? idRaw.trim() : "";
  if (!id) return { ok: false, error: "Missing id." };
  const raw = formData.get("content");
  const content = typeof raw === "string" ? raw.trim() : "";
  if (!content) return { ok: false, error: "Reminder can't be empty." };
  if (content.length > 10_000) {
    return { ok: false, error: "Too long (max 10,000 chars)." };
  }
  const parsed = parseDeadline(formData);
  if (parsed && typeof parsed === "object") return { ok: false, error: parsed.error };

  const supabase = createServerClient();
  const { data: existing, error: readErr } = await supabase
    .from("reminders")
    .select("deadline")
    .eq("id", id)
    .single();
  if (readErr) return { ok: false, error: readErr.message };

  const deadlineChanged = (existing?.deadline ?? null) !== (parsed ?? null);
  const update: Record<string, unknown> = { content, deadline: parsed };
  if (deadlineChanged) update.notified_day_before = false;

  const { error } = await supabase.from("reminders").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/reminders");
  return { ok: true, error: "" };
}

export async function completeReminder(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reminders")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[completeReminder]", error.message);
  revalidatePath("/reminders");
}

export async function uncompleteReminder(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reminders")
    .update({ completed_at: null })
    .eq("id", id);
  if (error) console.error("[uncompleteReminder]", error.message);
  revalidatePath("/reminders");
}

export async function deleteReminder(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reminders")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("[deleteReminder]", error.message);
  revalidatePath("/reminders");
  revalidatePath("/trash");
}

export async function restoreReminder(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase
    .from("reminders")
    .update({ deleted_at: null })
    .eq("id", id);
  if (error) console.error("[restoreReminder]", error.message);
  revalidatePath("/reminders");
  revalidatePath("/trash");
}

export async function permaDeleteReminder(formData: FormData): Promise<void> {
  const raw = formData.get("id");
  const id = typeof raw === "string" ? raw.trim() : "";
  if (!id) return;
  const supabase = createServerClient();
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) console.error("[permaDeleteReminder]", error.message);
  revalidatePath("/trash");
}

export async function sendTestPush(): Promise<void> {
  await broadcastPush({
    title: "IdeaHolder test push",
    body: "If you see this, notifications work on this device.",
    url: "/reminders",
  });
}
