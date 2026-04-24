import Link from "next/link";
import { createServerClient, type Idea } from "@/lib/supabase";
import IdeaForm from "@/components/IdeaForm";
import IdeaList from "@/components/IdeaList";
import Logo from "@/components/Logo";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerClient();

  const [ideasRes, trashCountRes] = await Promise.all([
    supabase
      .from("ideas")
      .select("id, number, content, created_at, deleted_at")
      .is("deleted_at", null)
      .order("number", { ascending: false }),
    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .not("deleted_at", "is", null),
  ]);

  const ideas: Idea[] = (ideasRes.data ?? []) as Idea[];
  const trashCount = trashCountRes.count ?? 0;

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <h1 className="text-xl font-semibold tracking-tight">IdeaHolder</h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-neutral-500">
          <Link
            href="/trash"
            className="transition-colors hover:text-neutral-900"
          >
            {trashCount > 0 ? `Trash (${trashCount})` : "Trash"}
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="transition-colors hover:text-neutral-900"
            >
              Log out
            </button>
          </form>
        </div>
      </header>

      <IdeaForm />

      {ideasRes.error && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load ideas: {ideasRes.error.message}
        </p>
      )}

      <IdeaList ideas={ideas} />
    </main>
  );
}
