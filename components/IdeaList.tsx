"use client";

import { useMemo, useState, type FormEvent } from "react";
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
      <div className="sticky top-0 z-10 -mx-5 bg-[color:var(--color-canvas)]/90 px-5 py-2 backdrop-blur">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={
            ideas.length
              ? `Search ${ideas.length} idea${ideas.length === 1 ? "" : "s"}…`
              : "Search…"
          }
          className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-base focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          {ideas.length === 0 ? "No ideas yet. Add one above." : "No matches."}
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {filtered.map((idea) => (
            <li key={idea.id} className="py-4">
              <div className="mb-1 flex items-baseline gap-3 text-xs text-neutral-500">
                <span className="font-mono font-medium text-neutral-700">
                  #{idea.number}
                </span>
                <span suppressHydrationWarning>
                  {formatDateTime(idea.created_at)}
                </span>
                <form
                  action={deleteIdea}
                  onSubmit={(e: FormEvent<HTMLFormElement>) => {
                    if (
                      !window.confirm(`Delete idea #${idea.number}?`)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className="ml-auto"
                >
                  <input type="hidden" name="id" value={idea.id} />
                  <button
                    type="submit"
                    aria-label={`Delete idea #${idea.number}`}
                    className="leading-none text-neutral-400 transition-colors hover:text-red-600"
                  >
                    <span aria-hidden="true" className="text-base">
                      ×
                    </span>
                  </button>
                </form>
              </div>
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-neutral-900">
                {idea.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
