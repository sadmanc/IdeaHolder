import Logo from "@/components/Logo";
import { logout } from "@/app/actions";

export default function PageHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <Logo size={36} />
        <div>
          <h1 className="font-serif-display text-[22px] leading-none tracking-tight text-[color:var(--color-ink)]">
            IdeaHolder
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-3)]">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-md px-2 py-1 text-xs text-[color:var(--color-ink-3)] transition hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-ink)]"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
