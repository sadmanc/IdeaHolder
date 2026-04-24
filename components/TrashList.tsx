"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { Idea } from "@/lib/supabase";
import { restoreIdea, permaDeleteIdea } from "@/app/actions";

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

export default function TrashList({ ideas }: { ideas: Idea[] }) {
  if (ideas.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        Trash is empty.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-neutral-200">
      {ideas.map((idea) => (
        <li key={idea.id} className="py-4">
          <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-neutral-500">
            <span className="font-mono font-medium text-neutral-700">
              #{idea.number}
            </span>
            <span>added <ClientTime iso={idea.created_at} /></span>
            {idea.deleted_at ? (
              <span className="text-neutral-400">
                · deleted <ClientTime iso={idea.deleted_at} />
              </span>
            ) : null}
          </div>
          <p className="mb-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-neutral-700">
            {idea.content}
          </p>
          <div className="flex items-center gap-2">
            <form action={restoreIdea}>
              <input type="hidden" name="id" value={idea.id} />
              <button
                type="submit"
                className="rounded border border-neutral-300 bg-white px-3 py-1 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-500"
              >
                Restore
              </button>
            </form>
            <form
              action={permaDeleteIdea}
              onSubmit={(e: FormEvent<HTMLFormElement>) => {
                if (
                  !window.confirm(
                    `Permanently delete idea #${idea.number}? This can't be undone.`,
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={idea.id} />
              <button
                type="submit"
                className="rounded border border-transparent px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:border-red-200 hover:bg-red-50"
              >
                Delete forever
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
