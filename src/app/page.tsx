"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import { Zap, Eye, EyeOff, ArrowRight, ChevronRight, AlertCircle, CheckCircle, Mail } from "lucide-react";

const features = [
  "Kanban boards with drag-and-drop",
  "Real-time team collaboration",
  "Priority tags & due dates",
  "Activity feed & notifications",
];

const logos = ["Vercel", "Linear", "Stripe", "Figma", "Notion"];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("alex@taskmatrix.io");
  const [password, setPassword] = useState("password123");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const login    = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const loading  = useAuthStore((s) => s.isLoading);
  const lastError = useAuthStore((s) => s.lastError);
  const pendingEmailConfirmation = useAuthStore((s) => s.pendingEmailConfirmation);
  const clearError = useAuthStore((s) => s.clearError);

  // Read ?mode=register from URL (set by /register redirect)
  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      switchMode(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch mode and reset form state
  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    clearError();
    setLoginSuccess(false);
    setEmail(toRegister ? "" : "alex@taskmatrix.io");
    setPassword(toRegister ? "" : "password123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLoginSuccess(false);

    // After login/register redirect to ?next or /dashboard
    const nextPath = searchParams.get("next") ?? "/dashboard";

    if (isRegister) {
      const success = await register(email, password);
      // pendingEmailConfirmation=true means user was created but email not verified
      // In that case the store already set pendingEmailConfirmation=true, just stay on page
      if (success && !useAuthStore.getState().pendingEmailConfirmation) {
        router.push(nextPath);
      }
      // If !success, lastError is set in the store — displayed below
    } else {
      const success = await login(email, password);
      if (success) {
        setLoginSuccess(true);
        router.push(nextPath);
      }
      // If !success, lastError is set in the store — displayed below
    }
  };

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── LEFT — brand panel ── */}
      <div className="hidden lg:flex flex-col w-[420px] xl:w-[480px] shrink-0 border-r border-border relative overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.04] opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-primary/8 to-transparent" />
        <div className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-primary/10 blur-[80px]" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5 p-8">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-foreground font-bold text-[15px] tracking-tight">TaskMatrix</span>
        </div>

        {/* Main copy */}
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

          {/* Social proof */}
          <div className="border border-border rounded-xl p-4 bg-muted/30">
            <p className="text-muted-foreground text-[12px] italic leading-relaxed mb-2">
              &ldquo;TaskMatrix cut our sprint planning time by 40%. The Kanban board is buttery smooth.&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-[8px] font-bold text-white">
                EL
              </div>
              <p className="text-muted-foreground/70 text-[11px]">Engineering Lead, Nexaflow</p>
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="relative z-10 border-t border-border px-8 py-5">
          <p className="text-muted-foreground/50 text-[10px] uppercase tracking-widest mb-3">Trusted by teams at</p>
          <div className="flex items-center gap-4">
            {logos.map((name) => (
              <span key={name} className="text-muted-foreground/50 text-[11px] font-medium">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — form panel ── */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
              <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="text-foreground font-bold text-[14px]">TaskMatrix</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground hidden sm:block">
              {isRegister ? "Already have an account?" : "No account?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(!isRegister)}
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
                id="auth-mode-toggle"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[360px]">

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-foreground text-xl font-semibold tracking-tight mb-1">
                {isRegister ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground text-[13px]">
                {isRegister
                  ? "Sign up to start managing your projects"
                  : "Sign in to continue to your workspace"}
              </p>
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { name: "GitHub",  icon: "⌥" },
                { name: "Google",  icon: "G" },
              ].map(({ name, icon }) => (
                <button
                  key={name}
                  type="button"
                  id={`${name.toLowerCase()}-login-btn`}
                  className="flex items-center justify-center gap-2 h-9 rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground hover:border-border transition-all text-[13px] font-medium cursor-pointer"
                >
                  <span className="text-[11px] font-bold opacity-70">{icon}</span>
                  {name}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground/50">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Unified email/password form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:border-primary/60 focus-visible:bg-accent focus-visible:ring-0 text-[13px]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                    Password
                  </label>
                  {!isRegister && (
                    <a href="#" className="text-[11px] text-muted-foreground/60 hover:text-foreground/70 transition-colors" id="forgot-password-link">
                      Forgot?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={isRegister ? 6 : undefined}
                    className="h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:border-primary/60 focus-visible:bg-accent focus-visible:ring-0 pr-10 text-[13px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground/60 transition-colors"
                    id="toggle-password-btn"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                id="auth-submit-btn"
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    {isRegister ? "Creating account…" : "Signing in…"}
                  </>
                ) : (
                  <>
                    {isRegister ? "Create account" : "Sign in"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Error message — real Supabase error */}
            {lastError && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] text-red-400 font-medium">
                    {lastError.includes("Email not confirmed")
                      ? "Email not confirmed yet."
                      : lastError.includes("Invalid login")
                      ? "Wrong email or password."
                      : lastError.includes("already registered")
                      ? "This email is already registered. Try signing in."
                      : lastError.includes("rate limit")
                      ? "Too many attempts. Please wait a moment and try again."
                      : lastError}
                  </p>
                  {lastError.includes("Email not confirmed") && (
                    <p className="text-[10px] text-red-400/70 mt-0.5">
                      Check your inbox and click the confirmation link first.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Login success flash */}
            {loginSuccess && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-400 font-medium">Signed in! Redirecting…</p>
              </div>
            )}

            {/* Email confirmation pending — shown after successful registration */}
            {pendingEmailConfirmation && (
              <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <p className="text-[11px] text-blue-400 font-semibold">Account created! Check your email.</p>
                </div>
                <p className="text-[11px] text-blue-400/70 pl-5">
                  We sent a confirmation link to <span className="font-medium text-blue-400">{email}</span>.
                  Click the link in the email, then come back and sign in.
                </p>
              </div>
            )}

            {/* Demo hint — login mode only */}
            {!isRegister && (
              <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
                <ChevronRight className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                <p className="text-[11px] text-muted-foreground">
                  Demo credentials are pre-filled. Just hit <span className="text-foreground/60 font-medium">Sign in</span>.
                </p>
              </div>
            )}

            {/* Mode toggle — mobile fallback */}
            <p className="text-center text-[11px] text-muted-foreground/50 mt-6 sm:hidden">
              {isRegister ? "Already have an account?" : "No account?"}{" "}
              <button
                type="button"
                onClick={() => switchMode(!isRegister)}
                className="underline hover:text-foreground/50 transition-colors"
                id="auth-mode-toggle-mobile"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </button>
            </p>

            <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
              By continuing you agree to our{" "}
              <a href="#" className="underline hover:text-foreground/50 transition-colors" id="terms-link">Terms</a>
              {" & "}
              <a href="#" className="underline hover:text-foreground/50 transition-colors" id="privacy-link">Privacy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
