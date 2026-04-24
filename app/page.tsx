import { createServerClient, type Idea } from "@/lib/supabase";
import IdeaForm from "@/components/IdeaForm";
import IdeaList from "@/components/IdeaList";
import { logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("ideas")
    .select("id, number, content, created_at")
    .order("number", { ascending: false });

  const ideas: Idea[] = (data ?? []) as Idea[];

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">IdeaHolder</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-xs text-neutral-500 transition-colors hover:text-neutral-900"
          >
            Log out
          </button>
        </form>
      </header>

      <IdeaForm />

      {error && (
        <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Couldn&apos;t load ideas: {error.message}
        </p>
      )}

      <IdeaList ideas={ideas} />
    </main>
  );
}
