import { createServerClient } from "@/lib/supabase";
import { type Reminder, REMINDER_COLUMNS } from "@/lib/reminders";
import Logo from "@/components/Logo";
import NavTabs from "@/components/NavTabs";
import ReminderForm from "@/components/ReminderForm";
import ReminderList from "@/components/ReminderList";
import EnableNotifications from "@/components/EnableNotifications";
import CalendarFeed from "@/components/CalendarFeed";
import { logout } from "../actions";

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

      <NavTabs active="reminders" />

      <ReminderForm />

      {error && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
