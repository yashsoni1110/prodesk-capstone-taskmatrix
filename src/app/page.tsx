// Server Component — no "use client".
// The static brand panel is rendered as plain HTML on the server (zero JS).
// The interactive form is a separate client chunk that loads after paint,
// keeping Supabase + auth-store out of the critical-path JS evaluation.

import { Suspense } from "react";
import LoginForm from "./login-form";
import { Zap } from "lucide-react";

const features = [
  "Kanban boards with drag-and-drop",
  "Real-time team collaboration",
  "Priority tags & due dates",
  "Activity feed & notifications",
];

const logos = ["Vercel", "Linear", "Stripe", "Figma", "Notion"];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isRegisterInitial = params.mode === "register";

  return (
    <main className="min-h-screen flex bg-background">

      {/* ── LEFT — static brand panel (pure SSR, zero client JS) ── */}
      <div className="hidden lg:flex flex-col w-[420px] xl:w-[480px] shrink-0 border-r border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/5 to-transparent" />


        <div className="relative z-10 flex items-center gap-2.5 p-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-foreground font-bold text-[15px] tracking-tight">TaskMatrix</span>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-8 pb-8">
          <h2 className="text-foreground text-2xl font-bold leading-tight tracking-tight mb-3">
            Ship faster with{" "}
            <span className="text-muted-foreground">clarity.</span>
          </h2>
          <p className="text-muted-foreground text-[13px] mb-8 leading-relaxed">
            The modern workspace for high-performing software teams.
          </p>

          <ul className="space-y-2.5 mb-10">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-muted-foreground text-[12px]">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <div className="border border-border rounded-xl p-4 bg-muted/30">
            <p className="text-muted-foreground text-[12px] italic leading-relaxed mb-2">
              &ldquo;TaskMatrix cut our sprint planning time by 40%. The Kanban board is buttery smooth.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                EL
              </div>
              <p className="text-muted-foreground text-[11px]">Engineering Lead, Nexaflow</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 border-t border-border px-8 py-5">
          <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-3">Trusted by teams at</p>
          <div className="flex items-center gap-4">
            {logos.map((name) => (
              <span key={name} className="text-muted-foreground text-[11px] font-medium">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — interactive form, deferred client JS chunk ── */}
      <Suspense fallback={<div className="flex-1" />}>
        <LoginForm isRegisterInitial={isRegisterInitial} />
      </Suspense>

    </main>
  );
}
