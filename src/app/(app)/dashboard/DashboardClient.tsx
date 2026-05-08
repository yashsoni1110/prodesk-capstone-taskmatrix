"use client";

import { useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/task-badges";
import { LiveDashboardStats } from "@/components/live-dashboard-stats";
import {
  Clock, ArrowRight, MessageSquare,
  FolderKanban, Plus, ArrowUpRight, ExternalLink,
} from "lucide-react";

import { useTasks, useTaskActions, useTasksLoading } from "@/store/task-store";
import { useProjects, useProjectActions, useProjectsLoading } from "@/store/project-store";
import { useCurrentUser, useSupabaseUser } from "@/store/auth-store";
import { MOCK_USERS, MOCK_ACTIVITY } from "@/lib/data";

// Lazy-load heavy components
const AnalyticsChart = dynamic(
  () => import("@/components/analytics-chart").then((m) => ({ default: m.AnalyticsChart })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] rounded-xl border border-border/60 bg-muted/20 animate-pulse" />
    ),
  }
);

const NewTaskDialog = dynamic(
  () => import("@/components/new-task-dialog").then((m) => ({ default: m.NewTaskDialog })),
  { ssr: false }
);

const statusColor: Record<string, string> = {
  done:         "bg-emerald-500",
  "in-progress": "bg-violet-500",
  review:       "bg-amber-500",
  todo:         "bg-blue-500",
  backlog:      "bg-slate-400",
};

export function DashboardClient() {
  const tasks    = useTasks();
  const projects = useProjects();
  const user        = useCurrentUser();
  const supaUser    = useSupabaseUser();
  const { fetchTasks }    = useTaskActions();
  const { fetchProjects } = useProjectActions();
  const tasksLoading    = useTasksLoading();
  
  useEffect(() => {
    if (supaUser?.id) {
      fetchTasks(supaUser.id);
      fetchProjects(supaUser.id);
    }
  }, [supaUser?.id, fetchTasks, fetchProjects]);

  const displayName = useMemo(
    () => user?.name ?? (supaUser?.email ? supaUser.email.split("@")[0] : null) ?? "You",
    [user?.name, supaUser?.email]
  );
  const displayEmail    = user?.email    ?? supaUser?.email    ?? "";
  const displayInitials = useMemo(
    () => user?.initials ?? displayName.slice(0, 2).toUpperCase(),
    [user?.initials, displayName]
  );

  const firstName = useMemo(() => displayName.split(" ")[0], [displayName]);
  const hour      = new Date().getHours();
  const greeting  = useMemo(
    () => hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening",
    []
  );

  const isRealUserInMock = !!user && MOCK_USERS.some(m => m.id === user.id);
  const workloadUsers = useMemo(
    () => [
      ...(!isRealUserInMock && supaUser
        ? [{ id: supaUser.id, name: displayName, initials: displayInitials, role: "member" }]
        : []),
      ...(isRealUserInMock ? MOCK_USERS : []),
    ] as Array<{ id: string; name: string; initials: string; role: string }>,
    [isRealUserInMock, supaUser?.id, displayName, displayInitials]
  );

  const recentTasks = useMemo(() => tasks.slice(0, 6), [tasks]);

  return (
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1 animate-fade-up">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5" id="dashboard-status-text">
            {displayEmail && <span className="text-muted-foreground/70">{displayEmail} · </span>}
            {tasks.filter(t => t.status === "done").length} of {tasks.length} tasks complete across {projects.length} projects.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border/80 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5" strokeWidth={1.8} />
            Projects
          </Link>
          <NewTaskDialog />
        </div>
      </div>

      <LiveDashboardStats />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">
        <div className="space-y-5">
          <AnalyticsChart />
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Recent Tasks</CardTitle>
                <Link href="/kanban" className="text-[12px] text-primary hover:underline underline-offset-2 flex items-center gap-1">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-[1fr_76px_76px_auto] gap-3 px-5 py-2.5 border-y border-border/40 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/70 mt-3">
                <span>Task</span>
                <span className="hidden sm:block">Priority</span>
                <span className="hidden sm:block">Due</span>
                <span />
              </div>
              <div className="divide-y divide-border/30">
                {tasksLoading ? (
                  [1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="h-4 flex-1 bg-muted/30 rounded-md animate-pulse" />
                    </div>
                  ))
                ) : (
                  recentTasks.map((task) => (
                    <div key={task.id} className="grid grid-cols-[1fr_76px_76px_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor[task.status] ?? "bg-slate-400"}`} />
                        <span className="text-[13px] font-medium truncate">{task.title}</span>
                      </div>
                      <div className="hidden sm:block">
                        <PriorityBadge priority={task.priority} />
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground/70 text-right">
                        <span className="truncate">{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-[13px] font-semibold">Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {MOCK_ACTIVITY.slice(0, 6).map((item) => (
                  <div key={item.id} className="px-4 py-2.5 text-[12px]">
                    <span className="font-semibold">{item.user.name}</span> {item.action} <span className="text-primary">{item.target}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
