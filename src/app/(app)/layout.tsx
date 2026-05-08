"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebarTrigger } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthStore } from "@/store/auth-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { useTaskStore } from "@/store/task-store";
import { useProjectStore } from "@/store/project-store";
import { ThemeProvider } from "@/components/theme-provider";

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
      // Sign-out detected: clear sensitive data from client stores
      useTaskStore.getState().clearTasks();
      useProjectStore.getState().clearProjects();
      router.replace("/");
    }
  }, [initialized, isAuthenticated, router]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar mobileTrigger={<MobileSidebarTrigger />} />
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-5 max-w-[1440px]">
              {!initialized || !isAuthenticated ? (
                <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
                  <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                  <p className="text-[11px] text-muted-foreground animate-pulse">Initializing session...</p>
                </div>
              ) : (
                <TooltipProvider>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center h-[60vh]">
                        <div className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                </TooltipProvider>
              )}
            </div>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            duration: 3500,
            style: { fontSize: "13px" },
          }}
        />
      </div>
    </ThemeProvider>
  );
}
