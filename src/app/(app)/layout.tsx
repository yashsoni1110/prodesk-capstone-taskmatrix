"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebarTrigger } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthStore } from "@/store/auth-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const initialized = useAuthStore((s) => s.initialized);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  // ── Initialize Supabase session + subscribe to auth changes ──────────────
  // initializeAuth() reads localStorage instantly (no network), then sets up
  // the onAuthStateChange listener. Returns an unsubscribe fn for cleanup.
  useEffect(() => {
    const unsubscribe = initializeAuth();
    return unsubscribe;
  }, [initializeAuth]);

  // ── Route guard: only redirect after the first auth check is done ─────────
  // Using `initialized` (not isLoading) prevents a false redirect on first
  // render before Supabase has read the cached session from localStorage.
  useEffect(() => {
    if (initialized && !isAuthenticated) {
      router.replace("/");
    }
  }, [initialized, isAuthenticated, router]);

  // Show spinner until the initial session check completes
  if (!initialized || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar mobileTrigger={<MobileSidebarTrigger />} />
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
