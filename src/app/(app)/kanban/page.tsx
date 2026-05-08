// Server Component
import { KanbanClient } from "./KanbanClient";
import { Suspense } from "react";

export default function KanbanPage() {
  return (
    <main className="h-full">
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanClient />
      </Suspense>
    </main>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/40 rounded-lg animate-pulse" />
          <div className="h-4 w-64 bg-muted/20 rounded-md animate-pulse" />
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-none w-[240px] sm:flex-1 sm:min-w-[200px] sm:max-w-[280px] space-y-3">
            <div className="h-10 bg-muted/20 rounded-lg animate-pulse" />
            <div className="h-32 bg-muted/5 rounded-lg animate-pulse" />
            <div className="h-32 bg-muted/5 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
