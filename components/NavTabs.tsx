import Link from "next/link";
import { createServerClient } from "@/lib/supabase";

type Tab = "ideas" | "reminders" | "trash";

const tabs: { key: Tab; label: string; href: string }[] = [
  { key: "ideas", label: "Ideas", href: "/ideas" },
  { key: "reminders", label: "Reminders", href: "/reminders" },
  { key: "trash", label: "Trash", href: "/trash" },
];

export default async function NavTabs({ active }: { active: Tab }) {
  const supabase = createServerClient();
  const [ideaTrash, reminderTrash] = await Promise.all([
    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .not("deleted_at", "is", null),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .not("deleted_at", "is", null),
  ]);
  const trashCount = (ideaTrash.count ?? 0) + (reminderTrash.count ?? 0);

  return (
    <nav className="mb-6 flex items-center gap-1 text-sm">
      {tabs.map((t) => {
        const isActive = t.key === active;
        const label =
          t.key === "trash" && trashCount > 0
            ? `${t.label} (${trashCount})`
            : t.label;
        return (
          <Link
            key={t.key}
            href={t.href}
            className={
              "rounded-md px-3 py-1.5 transition-colors " +
              (isActive
                ? "bg-black text-white"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900")
            }
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
