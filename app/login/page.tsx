import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAuthed()) redirect("/");
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">IdeaHolder</h1>
      <p className="mb-6 text-sm text-neutral-500">Enter your password.</p>
      <LoginForm />
    </main>
  );
}
