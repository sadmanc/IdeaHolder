"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase";
import {
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";

export type ActionState = { ok: boolean; error: string };

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
  revalidatePath("/");
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
  redirect("/");
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
  revalidatePath("/");
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
  revalidatePath("/");
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
