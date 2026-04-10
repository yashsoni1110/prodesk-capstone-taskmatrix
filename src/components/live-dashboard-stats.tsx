"use client";

import { useTasks } from "@/store/task-store";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2, ListTodo, Target,
  TrendingUp, ArrowUpRight, AlertTriangle,
} from "lucide-react";

/**
 * Live stat cards that subscribe to the Zustand task store.
 * Re-renders whenever tasks change (add / delete / move).
 */
export function LiveDashboardStats() {
  const tasks         = useTasks();
  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter((t) => t.status === "done").length;
  const pendingTasks  = tasks.filter((t) => t.status !== "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;
  const completionPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

      {/* Total Tasks */}
      <Card id="stat-total-tasks" className="relative overflow-hidden border-border/50 ring-1 ring-primary/15 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Total Tasks</p>
              <p className="text-4xl font-bold tabular-nums leading-none">{totalTasks}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-primary" />
                Across all active projects
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <ListTodo className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Sprint progress</span>
              <span>{completionPct}%</span>
            </div>
            <Progress value={completionPct} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      {/* Completed */}
      <Card id="stat-completed" className="relative overflow-hidden border-border/50 ring-1 ring-emerald-500/15 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Completed</p>
              <p className="text-4xl font-bold tabular-nums leading-none text-emerald-500">{doneTasks}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                {completionPct}% completion rate
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500/10" />
              <circle
                cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
                strokeDasharray={`${completionPct * 0.88} 88`}
                strokeLinecap="round"
                className="text-emerald-500"
              />
            </svg>
            <p className="text-[11px] text-muted-foreground leading-snug">
              {doneTasks} of {totalTasks} tasks<br />marked done
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card id="stat-pending" className="relative overflow-hidden border-border/50 ring-1 ring-amber-500/15 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Pending</p>
              <p className="text-4xl font-bold tabular-nums leading-none text-amber-500">{pendingTasks}</p>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                {inProgressTasks} in active progress
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            {[
              { label: "Backlog", count: tasks.filter(t => t.status === "backlog").length, color: "bg-slate-400" },
              { label: "To Do",   count: tasks.filter(t => t.status === "todo").length,    color: "bg-blue-500"  },
              { label: "Review",  count: tasks.filter(t => t.status === "review").length,  color: "bg-amber-500" },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="flex-1">{label}</span>
                <span className="font-medium tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
