"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, MobileSidebarTrigger } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { useAuthStore } from "@/store/auth-store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // ── Route guard: redirect to login if not authenticated ─────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  // While redirecting, show nothing (prevents flash of protected content)
  if (!isAuthenticated) {
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
