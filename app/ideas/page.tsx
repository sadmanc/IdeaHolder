import { createServerClient, type Idea } from "@/lib/supabase";
import IdeaForm from "@/components/IdeaForm";
import IdeaList from "@/components/IdeaList";
import NavTabs from "@/components/NavTabs";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("ideas")
    .select("id, number, content, created_at, deleted_at")
    .is("deleted_at", null)
    .order("number", { ascending: false });

  const ideas: Idea[] = (data ?? []) as Idea[];

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 sm:py-14">
      <PageHeader subtitle="Capture, expand, decide" />

      <NavTabs active="ideas" />

      <IdeaForm />

      {error && (
        <p className="mb-4 rounded-[var(--radius-input)] border border-[color:var(--color-danger)]/30 bg-[color:var(--color-danger)]/5 px-3 py-2 text-sm text-[color:var(--color-danger)]">
          Couldn&apos;t load ideas: {error.message}
        </p>
      )}

      <IdeaList ideas={ideas} />
    </main>
  );
}
