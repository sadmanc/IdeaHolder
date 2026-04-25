import { createServerClient, type Idea } from "@/lib/supabase";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";
import Logo from "@/components/Logo";
import NavTabs from "@/components/NavTabs";
import TrashList from "@/components/TrashList";
import TrashRemindersList from "@/components/TrashRemindersList";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const supabase = createServerClient();
  const [ideasRes, remindersRes] = await Promise.all([
    supabase
      .from("ideas")
      .select("id, number, content, created_at, deleted_at")
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
    supabase
      .from("reminders")
      .select(REMINDER_COLUMNS)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const ideas = (ideasRes.data ?? []) as Idea[];
  const reminders = (remindersRes.data ?? []) as Reminder[];

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <h1 className="text-xl font-semibold tracking-tight">IdeaHolder</h1>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Log out
          </button>
        </form>
      </header>

      <NavTabs active="trash" />

      <p className="mb-6 text-xs text-neutral-500">
        Restored items reappear in their list with their original number.
        Permanently deleted items are gone.
      </p>

      {(ideasRes.error || remindersRes.error) && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load trash:{" "}
          {ideasRes.error?.message ?? remindersRes.error?.message}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Deleted ideas {ideas.length > 0 ? `(${ideas.length})` : ""}
        </h2>
        <TrashList ideas={ideas} />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Deleted reminders {reminders.length > 0 ? `(${reminders.length})` : ""}
        </h2>
        <TrashRemindersList reminders={reminders} />
      </section>
    </main>
  );
}
