"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { Idea } from "@/lib/supabase";
import { deleteIdea } from "@/app/actions";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function ClientTime({ iso }: { iso: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <span suppressHydrationWarning>{mounted ? formatDateTime(iso) : ""}</span>
  );
}

export default function IdeaList({ ideas }: { ideas: Idea[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return ideas;
    return ideas.filter(
      (i) =>
        i.content.toLowerCase().includes(query) ||
        `#${i.number}`.includes(query) ||
        String(i.number).includes(query),
    );
  }, [q, ideas]);

  return (
    <section>
      <div className="sticky top-0 z-10 -mx-5 mb-3 bg-[color:var(--color-canvas)]/85 px-5 py-2 backdrop-blur">
        <div className="relative">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-ink-4)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={
              ideas.length
                ? `Search ${ideas.length} idea${ideas.length === 1 ? "" : "s"} or #number`
                : "Search…"
            }
            className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] py-2 pl-9 pr-3 text-[15px] text-[color:var(--color-ink)] placeholder:text-[color:var(--color-ink-4)] shadow-[var(--shadow-sm)] transition focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState ideas={ideas.length} />
      ) : (
        <ul className="space-y-2">
          {filtered.map((idea) => (
            <li
              key={idea.id}
              className="group animate-in rounded-[var(--radius-card)] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-sm)] transition hover:border-[color:var(--color-line-strong)] hover:shadow-[var(--shadow-md)]"
            >
              <div className="mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-wide text-[color:var(--color-ink-3)]">
                <span className="font-mono text-[color:var(--color-accent)]">
                  #{idea.number}
                </span>
                <span aria-hidden="true">·</span>
                <span className="normal-case tracking-normal">
                  <ClientTime iso={idea.created_at} />
                </span>
                <form
                  action={deleteIdea}
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    if (!window.confirm(`Delete idea #${idea.number}?`)) {
                      e.preventDefault();
                    }
                  }}
                  className="ml-auto"
                >
                  <input type="hidden" name="id" value={idea.id} />
                  <button
                    type="submit"
                    aria-label={`Delete idea #${idea.number}`}
                    className="rounded-md p-1 leading-none text-[color:var(--color-ink-4)] opacity-0 transition group-hover:opacity-100 hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-danger)] focus:opacity-100"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M3 3l10 10M13 3 3 13" />
                    </svg>
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-[color:var(--color-ink)]">
                {idea.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState({ ideas }: { ideas: number }) {
  if (ideas === 0) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[color:var(--color-line-strong)] bg-[color:var(--color-surface)]/50 p-8 text-center">
        <div className="mx-auto mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent-ink)]">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18h6M10 22h4" />
            <path d="M12 2a7 7 0 0 0-4 12.7c.6.6 1 1.4 1 2.3v1h6v-1c0-.9.4-1.7 1-2.3A7 7 0 0 0 12 2Z" />
          </svg>
        </div>
        <p className="text-[15px] font-medium text-[color:var(--color-ink)]">
          No ideas yet.
        </p>
        <p className="mt-1 text-sm text-[color:var(--color-ink-3)]">
          Capture the next one before it slips. They&apos;re numbered and
          searchable for later.
        </p>
      </div>
    );
  }
  return (
    <p className="py-12 text-center text-sm text-[color:var(--color-ink-3)]">
      No matches.
    </p>
  );
}
