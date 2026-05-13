import { createServerClient } from "@/lib/supabase";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";
import NavTabs from "@/components/NavTabs";
import PageHeader from "@/components/PageHeader";
import ReminderForm from "@/components/ReminderForm";
import ReminderList from "@/components/ReminderList";
import EnableNotifications from "@/components/EnableNotifications";
import CalendarFeed from "@/components/CalendarFeed";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reminders")
    .select(REMINDER_COLUMNS)
    .is("deleted_at", null)
    .order("number", { ascending: false });

  const reminders: Reminder[] = (data ?? []) as Reminder[];
  const calendarToken = process.env.CALENDAR_FEED_TOKEN ?? "";
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <PageHeader subtitle="Things to come back to" />

      <NavTabs active="reminders" />

      <ReminderForm />

      {error && (
        <p className="mb-4 rounded-[var(--radius-input)] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/5 px-3 py-2 text-sm text-[color:var(--color-danger)]">
          Couldn&apos;t load reminders: {error.message}
        </p>
      )}

      <ReminderList reminders={reminders} />

      <div className="mt-10 space-y-4">
        <EnableNotifications vapidPublicKey={vapidPublicKey} />
        <CalendarFeed token={calendarToken} />
      </div>
    </main>
  );
}
