import { createServerClient, type Idea } from "@/lib/supabase";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";
import NavTabs from "@/components/NavTabs";
import PageHeader from "@/components/PageHeader";
import TrashList from "@/components/TrashList";
import TrashRemindersList from "@/components/TrashRemindersList";

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
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <PageHeader subtitle="Restore or delete forever" />

      <NavTabs active="trash" />

      <p className="mb-6 text-sm text-[color:var(--color-ink-3)]">
        Restored items return to their list with their original number.
        Permanently deleted items are gone.
      </p>

      {(ideasRes.error || remindersRes.error) && (
        <p className="mb-4 rounded-[var(--radius-input)] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/5 px-3 py-2 text-sm text-[color:var(--color-danger)]">
          Couldn&apos;t load trash:{" "}
          {ideasRes.error?.message ?? remindersRes.error?.message}
        </p>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-3)]">
          Deleted ideas{" "}
          {ideas.length > 0 && (
            <span className="text-[color:var(--color-ink-4)]">
              ({ideas.length})
            </span>
          )}
        </h2>
        <TrashList ideas={ideas} />
      </section>

      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-ink-3)]">
          Deleted reminders{" "}
          {reminders.length > 0 && (
            <span className="text-[color:var(--color-ink-4)]">
              ({reminders.length})
            </span>
          )}
        </h2>
        <TrashRemindersList reminders={reminders} />
      </section>
    </main>
  );
}
