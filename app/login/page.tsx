import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import Logo from "@/components/Logo";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/");
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-12">
      <div className="mb-6 flex items-center gap-2.5">
        <Logo size={32} />
        <h1 className="font-serif-display text-2xl tracking-tight text-[color:var(--color-ink)]">
          IdeaHolder
        </h1>
      </div>
      <p className="mb-6 text-sm text-[color:var(--color-ink-3)]">
        Capture, expand, decide. Enter your password to continue.
      </p>
      <LoginForm />
    </main>
  );
}
