import Link from "next/link";
import { createServerClient, type Idea } from "@/lib/supabase";
import Logo from "@/components/Logo";
import TrashList from "@/components/TrashList";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id, number, content, created_at, deleted_at")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  const ideas = (data ?? []) as Idea[];

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <h1 className="text-xl font-semibold tracking-tight">Trash</h1>
        </div>
        <Link
          href="/"
          className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
        >
          ← Back
        </Link>
      </header>

      <p className="mb-4 text-xs text-neutral-500">
        Restored ideas reappear on the home page with their original number.
        Permanently deleted ideas are gone.
      </p>

      {error && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load trash: {error.message}
        </p>
      )}

      <TrashList ideas={ideas} />
    </main>
  );
}
