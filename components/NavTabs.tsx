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
    <nav
      role="tablist"
      aria-label="Sections"
      className="mb-6 inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-1 text-sm shadow-[var(--shadow-sm)]"
    >
      {tabs.map((t) => {
        const isActive = t.key === active;
        const isTrash = t.key === "trash";
        return (
          <Link
            key={t.key}
            href={t.href}
            role="tab"
            aria-selected={isActive}
            className={
              "rounded-[var(--radius-pill)] px-3.5 py-1.5 transition " +
              (isActive
                ? "bg-[color:var(--color-ink)] text-white shadow-[var(--shadow-sm)]"
                : "text-[color:var(--color-ink-2)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]")
            }
          >
            <span>{t.label}</span>
            {isTrash && trashCount > 0 && (
              <span
                className={
                  "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium leading-none " +
                  (isActive
                    ? "bg-white/20 text-white"
                    : "bg-[color:var(--color-surface-2)] text-[color:var(--color-ink-3)]")
                }
              >
                {trashCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
