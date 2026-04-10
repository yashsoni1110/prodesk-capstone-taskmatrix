"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuthStore } from "@/store/auth-store";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Zap, Eye, EyeOff, ArrowRight, ChevronRight, AlertCircle, X } from "lucide-react";

const features = [
  "Kanban boards with drag-and-drop",
  "Real-time team collaboration",
  "Priority tags & due dates",
  "Activity feed & notifications",
];

const logos = ["Vercel", "Linear", "Stripe", "Figma", "Notion"];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("alex@taskmatrix.io");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.isLoading);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const success = await login(email, password);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials. Try the pre-filled demo email.");
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
              No account?{" "}
              <button
                type="button"
                onClick={() => setShowSignUp(true)}
                className="text-foreground/70 hover:text-foreground transition-colors font-medium"
                id="signup-link"
              >
                Sign up
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
              <h1 className="text-foreground text-xl font-semibold tracking-tight mb-1">Welcome back</h1>
              <p className="text-muted-foreground text-[13px]">Sign in to continue to your workspace</p>
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

            {/* Email form */}
            <form onSubmit={handleSignIn} className="space-y-3.5">
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
                  <a href="#" className="text-[11px] text-muted-foreground/60 hover:text-foreground/70 transition-colors" id="forgot-password-link">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                id="signin-submit-btn"
                className="w-full h-9 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Error message */}
            {error && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400">{error}</p>
              </div>
            )}

            {/* Demo hint */}
            <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
              <ChevronRight className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Demo credentials are pre-filled. Just hit <span className="text-foreground/60 font-medium">Sign in</span>.
              </p>
            </div>

            <p className="text-center text-[11px] text-muted-foreground/50 mt-6">
              By continuing you agree to our{" "}
              <a href="#" className="underline hover:text-foreground/50 transition-colors" id="terms-link">Terms</a>
              {" & "}
              <a href="#" className="underline hover:text-foreground/50 transition-colors" id="privacy-link">Privacy</a>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sign Up Dialog ── */}
      <Dialog open={showSignUp} onOpenChange={setShowSignUp}>
        <DialogContent className="sm:max-w-[400px] bg-[oklch(0.13_0.015_264)] border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white">Create your account</DialogTitle>
            <DialogDescription className="text-[13px] text-white/50">
              Start managing your projects with TaskMatrix
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSignUpLoading(true);
              // Simulate API delay
              await new Promise((r) => setTimeout(r, 1000));
              // In demo mode, log in as the default user
              const success = await login("alex@taskmatrix.io", "password123");
              setSignUpLoading(false);
              if (success) {
                setShowSignUp(false);
                router.push("/dashboard");
              }
            }}
            className="space-y-4 mt-2"
          >
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 block">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Alex Morgan"
                required
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 h-10"
                id="signup-name-input"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                required
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 h-10"
                id="signup-email-input"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5 block">
                Password
              </label>
              <Input
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25 h-10"
                id="signup-password-input"
              />
            </div>
            <button
              type="submit"
              disabled={signUpLoading}
              className="w-full flex items-center justify-center gap-2 h-10 px-4 bg-primary text-primary-foreground text-[13px] font-semibold rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
              id="signup-submit-btn"
            >
              {signUpLoading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-white/30">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setShowSignUp(false)}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
