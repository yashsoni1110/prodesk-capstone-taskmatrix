// Server Component
import { TeamClient } from "./TeamClient";
import { Suspense } from "react";

export default function TeamPage() {
  return (
    <main className="min-h-full max-w-[1000px]">
      <Suspense fallback={<TeamSkeleton />}>
        <TeamClient />
      </Suspense>
    </main>
  );
}

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-4 w-56 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border/40 bg-muted/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
