// Server Component
import { ProjectsClient } from "./ProjectsClient";
import { Suspense } from "react";

export default function ProjectsPage() {
  return (
    <main className="min-h-full max-w-[1200px]">
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsClient />
      </Suspense>
    </main>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-border/40 bg-muted/10 animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-40 rounded-xl border border-border/40 bg-muted/5 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
