"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/lib/supabase";
import { Zap, Eye, EyeOff, ArrowRight, ChevronRight, AlertCircle, CheckCircle, Mail } from "lucide-react";

export default function LoginForm({ isRegisterInitial = false }: { isRegisterInitial?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRegister, setIsRegister] = useState(isRegisterInitial);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(isRegisterInitial ? "" : "alex@taskmatrix.io");
  const [password, setPassword] = useState(isRegisterInitial ? "" : "password123");
  
  // Local state instead of global store to minimize hydration overhead
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [pendingEmailConfirmation, setPendingEmailConfirmation] = useState(false);

  // Sync state if prop changes (e.g. back/forward navigation)
  useEffect(() => {
    setIsRegister(isRegisterInitial);
    setEmail(isRegisterInitial ? "" : "alex@taskmatrix.io");
    setPassword(isRegisterInitial ? "" : "password123");
  }, [isRegisterInitial]);

  const switchMode = (toRegister: boolean) => {
    setIsRegister(toRegister);
    setLastError(null);
    setLoginSuccess(false);
    setPendingEmailConfirmation(false);
    setEmail(toRegister ? "" : "alex@taskmatrix.io");
    setPassword(toRegister ? "" : "password123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLastError(null);
    setLoginSuccess(false);
    setLoading(true);
    
    const nextPath = searchParams.get("next") ?? "/dashboard";
    
    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (!data.user) throw new Error("Registration failed");
        
        if (!data.session) {
          setPendingEmailConfirmation(true);
        } else {
          setLoginSuccess(true);
          router.push(nextPath);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        // Handle mock credentials fallback for demo environment
        if (error) {
          const isMock = email.endsWith("@taskmatrix.io") && password === "password123";
          if (isMock) {
            setLoginSuccess(true);
            router.push(nextPath);
            return;
          }
          throw error;
        }

        if (data.user) {
          setLoginSuccess(true);
          router.push(nextPath);
        }
      }
    } catch (err: any) {
      setLastError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-foreground font-bold text-[14px]">TaskMatrix</span>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[13px] text-muted-foreground hidden sm:block">
            {isRegister ? "Already have an account?" : "No account?"}{" "}
            <button type="button" onClick={() => switchMode(!isRegister)}
              className="text-foreground/70 hover:text-foreground transition-all duration-300 font-medium"
              id="auth-mode-toggle">
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </span>
          <ThemeToggle />
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[360px]">
          <div className="mb-7">
            <h1 className="text-foreground text-xl font-semibold tracking-tight mb-1">
              {isRegister ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-muted-foreground text-[13px]">
              {isRegister ? "Sign up to start managing your projects" : "Sign in to continue to your workspace"}
            </p>
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {[{ name: "GitHub", icon: "⌥" }, { name: "Google", icon: "G" }].map(({ name, icon }) => (
              <button key={name} type="button" id={`${name.toLowerCase()}-login-btn`}
                className="flex items-center justify-center gap-2 h-9 rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-300 text-[13px] font-medium cursor-pointer">
                <span className="text-[11px] font-bold opacity-70">{icon}</span>{name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                Email address
              </label>
              <Input id="email" type="email" placeholder="you@company.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required
                className="h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:border-primary/60 focus-visible:bg-accent focus-visible:ring-0 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11px] font-medium text-muted-foreground uppercase tracking-[0.06em]">
                  Password
                </label>
                {!isRegister && (
                  <a href="#" className="text-[11px] text-muted-foreground hover:text-foreground transition-all duration-300" id="forgot-password-link">
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  required minLength={isRegister ? 6 : undefined}
                  className="h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/40 focus-visible:border-primary/60 focus-visible:bg-accent focus-visible:ring-0 pr-10 text-[13px]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all duration-300"
                  id="toggle-password-btn" aria-label={showPassword ? "Hide password" : "Show password"} tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} id="auth-submit-btn"
              className="w-full h-9 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 active:opacity-80 transition-all duration-300 disabled:opacity-60 mt-2">
              {loading ? (
                <><span className="w-3.5 h-3.5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                  {isRegister ? "Creating account…" : "Signing in…"}</>
              ) : (
                <>{isRegister ? "Create account" : "Sign in"}<ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </form>

          {lastError && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] text-red-400 font-medium">
                  {lastError.includes("Email not confirmed") ? "Email not confirmed yet."
                    : lastError.includes("Invalid login") ? "Wrong email or password."
                    : lastError.includes("already registered") ? "This email is already registered. Try signing in."
                    : lastError.includes("rate limit") ? "Too many attempts. Please wait a moment and try again."
                    : lastError}
                </p>
                {lastError.includes("Email not confirmed") && (
                  <p className="text-[10px] text-red-400/70 mt-0.5">Check your inbox and click the confirmation link first.</p>
                )}
              </div>
            </div>
          )}

          {loginSuccess && (
            <div className="mt-3 flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <p className="text-[11px] text-emerald-400 font-medium">Signed in! Redirecting…</p>
            </div>
          )}

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

          {!isRegister && (
            <div className="mt-5 flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border">
              <ChevronRight className="w-3.5 h-3.5 text-primary/70 shrink-0" />
              <p className="text-[11px] text-muted-foreground">
                Demo credentials are pre-filled. Just hit <span className="text-foreground font-medium">Sign in</span>.
              </p>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground mt-6 sm:hidden">
            {isRegister ? "Already have an account?" : "No account?"}{" "}
            <button type="button" onClick={() => switchMode(!isRegister)}
              className="underline hover:text-foreground transition-all duration-300" id="auth-mode-toggle-mobile">
              {isRegister ? "Sign in" : "Sign up"}
            </button>
          </p>

          <p className="text-center text-[11px] text-muted-foreground mt-4">
            By continuing you agree to our{" "}
            <a href="#" className="underline hover:text-foreground transition-all duration-300" id="terms-link">Terms</a>
            {" & "}
            <a href="#" className="underline hover:text-foreground transition-all duration-300" id="privacy-link">Privacy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
