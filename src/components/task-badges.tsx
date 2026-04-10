import { Badge } from "@/components/ui/badge";
import type { Priority, TaskStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

// ─── Priority Badge ────────────────────────────────────────────────────────────

const priorityConfig: Record<Priority, { label: string; dot: string; className: string }> = {
  low:      { label: "Low",      dot: "bg-slate-400",  className: "bg-slate-500/10 text-slate-400 border-slate-500/20"  },
  medium:   { label: "Medium",   dot: "bg-blue-400",   className: "bg-blue-500/10  text-blue-400  border-blue-500/20"   },
  high:     { label: "High",     dot: "bg-amber-400",  className: "bg-amber-500/10 text-amber-400 border-amber-500/20"  },
  critical: { label: "Critical", dot: "bg-red-400",    className: "bg-red-500/10   text-red-400   border-red-500/20"    },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, dot, className } = priorityConfig[priority];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em] px-1.5 py-0.5 rounded border",
      className
    )}>
      <span className={`w-1 h-1 rounded-full ${dot} shrink-0`} />
      {label}
    </span>
  );
}

// ─── Status Badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  backlog:      { label: "Backlog",     className: "bg-slate-500/10  text-slate-400  border-slate-500/20"  },
  todo:         { label: "To Do",       className: "bg-blue-500/10   text-blue-400   border-blue-500/20"   },
  "in-progress":{ label: "In Progress", className: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  review:       { label: "Review",      className: "bg-amber-500/10  text-amber-400  border-amber-500/20"  },
  done:         { label: "Done",        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn("text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0", className)}
    >
      {label}
    </Badge>
  );
}
