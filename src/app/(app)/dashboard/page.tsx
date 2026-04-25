"use client";


import { useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/task-badges";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { LiveDashboardStats } from "@/components/live-dashboard-stats";
import { AnalyticsChart } from "@/components/analytics-chart";
import {
  Clock, ArrowRight, MessageSquare,
  FolderKanban, Plus, ArrowUpRight, ExternalLink,
} from "lucide-react";
import { useTasks, useTaskActions, useTasksLoading } from "@/store/task-store";
import { useProjects, useProjectActions, useProjectsLoading } from "@/store/project-store";
import { useCurrentUser, useSupabaseUser } from "@/store/auth-store";
import { MOCK_USERS, MOCK_ACTIVITY } from "@/lib/data";


/* ── Removed static weekBars — replaced by AnalyticsChart (Recharts) ──────── */


const activityDotColor: Record<string, string> = {
  task:    "bg-violet-500",
  comment: "bg-blue-500",
  project: "bg-emerald-500",
  member:  "bg-amber-500",
};

const ROLE_GRAD: Record<string, string> = {
  admin:     "from-violet-500 to-purple-600",
  manager:   "from-blue-500   to-cyan-600",
  developer: "from-emerald-500 to-teal-600",
  designer:  "from-pink-500   to-rose-600",
};

const statusColor: Record<string, string> = {
  done:         "bg-emerald-500",
  "in-progress": "bg-violet-500",
  review:       "bg-amber-500",
  todo:         "bg-blue-500",
  backlog:      "bg-slate-400",
};

export default function DashboardPage() {
  const tasks    = useTasks();
  const projects = useProjects();
  const user        = useCurrentUser();
  const supaUser    = useSupabaseUser();
  const { fetchTasks }    = useTaskActions();
  const { fetchProjects } = useProjectActions();
  const tasksLoading    = useTasksLoading();
  const projectsLoading = useProjectsLoading();
  const isLoading = tasksLoading || projectsLoading;
  const recentTasks = tasks.slice(0, 6);

  // Fetch real data from Supabase on mount
  useEffect(() => {
    if (supaUser?.id) {
      fetchTasks(supaUser.id);
      fetchProjects(supaUser.id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supaUser?.id]);

  // ── Derive display values from real auth data ────────────────────────────────
  const displayName     = user?.name
    ?? (supaUser?.email ? supaUser.email.split("@")[0] : null)
    ?? "You";
  const displayEmail    = user?.email    ?? supaUser?.email    ?? "";
  const displayInitials = user?.initials
    ?? displayName.slice(0, 2).toUpperCase();

  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Build Team Workload list ────────────────────────────────────────────
  // For real (non-demo) users: show only themselves in workload
  // For demo users (mock email match): show full MOCK_USERS roster
  const isRealUserInMock = !!user && MOCK_USERS.some(m => m.id === user.id);
  const workloadUsers: Array<{ id: string; name: string; initials: string; role: string }> = [
    ...(!isRealUserInMock && supaUser
      ? [{ id: supaUser.id, name: displayName, initials: displayInitials, role: "member" }]
      : []),
    ...(isRealUserInMock ? MOCK_USERS : []),
  ];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="h-8 w-64 rounded-md bg-muted/40 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted/40 animate-pulse" />
          ))}
        </div>
        <div className="h-56 rounded-xl bg-muted/40 animate-pulse" />
      </div>
    );
  }


  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {greeting}, {firstName} 👋
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {displayEmail && <span className="text-muted-foreground/60">{displayEmail} · </span>}
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

      {/* ── 3 Stat Cards ── */}
      <LiveDashboardStats />

      {/* ── 2-col grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5">

        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Analytics Chart (Recharts) */}
          <AnalyticsChart />

          {/* Recent Tasks table */}
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-5 pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Recent Tasks</CardTitle>
                <Link
                  href="/kanban"
                  className="text-[12px] text-primary hover:underline underline-offset-2 flex items-center gap-1"
                  id="view-all-tasks-link"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table head */}
              <div className="grid grid-cols-[1fr_76px_76px_auto] gap-3 px-5 py-2.5 border-y border-border/40 text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground/60 mt-3">
                <span>Task</span>
                <span className="hidden sm:block">Priority</span>
                <span className="hidden sm:block">Due</span>
                <span />
              </div>
              <div className="divide-y divide-border/30">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-[1fr_76px_76px_auto] gap-3 items-center px-5 py-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColor[task.status] ?? "bg-slate-400"}`} />
                      <span className="text-[13px] font-medium truncate">{task.title}</span>
                    </div>
                    <div className="hidden sm:block">
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground/70">
                      <Clock className="w-3 h-3 shrink-0" strokeWidth={1.8} />
                      <span className="truncate">
                        {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 justify-end">
                      {task.comments > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" strokeWidth={1.6} />{task.comments}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {recentTasks.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-4 text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Plus className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-foreground">No tasks yet</p>
                      <p className="text-[12px] text-muted-foreground/70 mt-0.5">Create your first task to get started</p>
                    </div>
                    <NewTaskDialog />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Projects */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-semibold">Active Projects</h2>
              <Link href="/projects" className="text-[12px] text-primary hover:underline underline-offset-2 flex items-center gap-1" id="view-all-projects-link">
                All projects <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-4 border border-border/40 rounded-xl text-muted-foreground">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <FolderKanban className="w-7 h-7 text-emerald-500" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">No projects yet</p>
                  <p className="text-[12px] text-muted-foreground/70 mt-0.5">Head to Projects to create your first one</p>
                </div>
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-[13px] font-medium hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" /> New Project
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
              {projects.slice(0, 4).map((project) => {
                const projectTasks = tasks.filter(t => t.projectId === project.id);
                const done = projectTasks.filter(t => t.status === "done").length;
                const pct  = projectTasks.length > 0
                  ? Math.round((done / projectTasks.length) * 100)
                  : project.progress;

                return (
                  <Card
                    key={project.id}
                    className="border-border/60 hover:border-border hover:-translate-y-px transition-all duration-150 cursor-pointer group overflow-hidden"
                  >
                    {/* colored top accent */}
                    <div className="h-px" style={{ backgroundColor: project.color }} />
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white text-[11px] font-bold"
                          style={{ backgroundColor: project.color + "22", color: project.color }}
                        >
                          {project.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold truncate group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">{project.description}</p>
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums" style={{ color: project.color }}>
                          {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-1 mb-3" />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {project.members.slice(0, 4).map((m) => (
                            <Avatar key={m.id} className="h-5 w-5 -ml-1.5 first:ml-0 border-2 border-card">
                              <AvatarFallback className="text-[8px] font-bold bg-primary/15 text-primary">{m.initials}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.members.length > 4 && (
                            <span className="text-[10px] text-muted-foreground/70 ml-2">+{project.members.length - 4}</span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground/60">
                          {projectTasks.length || project.taskCount} tasks
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <CardTitle className="text-[13px] font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-3 space-y-px">
              {[
                { label: "New Task",      href: "/kanban",   icon: Plus,         color: "text-primary"     },
                { label: "Open Kanban",   href: "/kanban",   icon: ArrowUpRight, color: "text-violet-500"  },
                { label: "Invite Member", href: "/team",     icon: FolderKanban, color: "text-blue-500"    },
                { label: "New Project",   href: "/projects", icon: ExternalLink, color: "text-emerald-500" },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-accent/60 transition-colors cursor-pointer group">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} strokeWidth={1.8} />
                    <span className="text-[13px] font-medium flex-1">{label}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Activity</CardTitle>
                <Link href="/activity" className="text-[12px] text-primary hover:underline underline-offset-2 flex items-center gap-1">
                  All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {MOCK_ACTIVITY.slice(0, 6).map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-0.5">
                      {item.user.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] leading-snug">
                        <span className="font-semibold">{item.user.name}</span>{" "}
                        <span className="text-muted-foreground">{item.action}</span>{" "}
                        <span className="font-medium text-primary">{item.target}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${activityDotColor[item.type] ?? "bg-primary"}`} />
                        <span className="text-[10px] text-muted-foreground/60">{item.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Workload */}
          <Card className="border-border/60">
            <CardHeader className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Team Workload</CardTitle>
                <Link href="/team" className="text-[12px] text-primary hover:underline underline-offset-2">View team</Link>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {workloadUsers.map((u) => {
                const userTasks = tasks.filter((t) => t.assignee.id === u.id);
                const done = userTasks.filter((t) => t.status === "done").length;
                const pct  = userTasks.length > 0 ? Math.round((done / userTasks.length) * 100) : 0;
                const grad = ROLE_GRAD[(u as { role: string }).role] ?? "from-primary to-violet-600";
                const isMe = u.id === supaUser?.id || u.id === user?.id;
                return (
                  <div key={u.id} className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                      {u.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium truncate">
                          {u.name.split(" ")[0]}{isMe && <span className="ml-1 text-[10px] text-primary font-semibold">(you)</span>}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-2">{done}/{userTasks.length}</span>
                      </div>
                      <Progress value={pct} className="h-1" />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
