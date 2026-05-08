// Server Component
// Renders the initial shell and header to fix LCP hydration delay.
// The LCP element (greeting & status text) is now part of the initial HTML.

import { DashboardClient } from "./DashboardClient";
import { Suspense } from "react";

export default function DashboardPage() {
  // Compute initial greeting on server based on server time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <main className="min-h-full">
      <div className="space-y-5">
        {/* We wrap the client component in Suspense to let the shell paint first */}
        <Suspense fallback={<DashboardSkeleton greeting={greeting} />}>
          <DashboardClient />
        </Suspense>
      </div>
    </main>
  );
}

function DashboardSkeleton({ greeting }: { greeting: string }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, ... 👋
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Calculating your workspace status...
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-border/40 bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
