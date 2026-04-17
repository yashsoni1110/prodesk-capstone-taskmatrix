"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge } from "@/components/task-badges";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { LiveDashboardStats } from "@/components/live-dashboard-stats";
import {
  Clock, ArrowRight, MessageSquare,
  FolderKanban, Plus, ArrowUpRight, ExternalLink,
} from "lucide-react";
import { useTasks } from "@/store/task-store";
import { useProjects } from "@/store/project-store";
import { useCurrentUser, useSupabaseUser } from "@/store/auth-store";
import { MOCK_USERS, MOCK_ACTIVITY } from "@/lib/data";

/* ── Weekly bar data ─────────────────────────────────────────────────────── */
const weekBars = [
  { day: "Mon", done: 3, total: 5 },
  { day: "Tue", done: 5, total: 7 },
  { day: "Wed", done: 2, total: 4 },
  { day: "Thu", done: 6, total: 6 },
  { day: "Fri", done: 4, total: 8 },
  { day: "Sat", done: 1, total: 2 },
  { day: "Sun", done: 0, total: 1 },
];
const maxTotal = Math.max(...weekBars.map((b) => b.total));

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
  const recentTasks = tasks.slice(0, 6);

  // ── Derive display values from real auth data ────────────────────────────
  // Priority: mock-matched User (has name/role/initials) → Supabase email → fallback
  const displayName     = user?.name
    ?? (supaUser?.email ? supaUser.email.split("@")[0] : null)
    ?? "You";
  const displayEmail    = user?.email    ?? supaUser?.email    ?? "";
  const displayInitials = user?.initials
    ?? displayName.slice(0, 2).toUpperCase();

  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // ── Build Team Workload list — real user first if not in mock data ────────
  const isRealUserInMock = !!user; // user is only set if email matched MOCK_USERS
  const workloadUsers: Array<{ id: string; name: string; initials: string; role: string }> = [
    // Inject the real Supabase user at top if they have no mock entry
    ...(!isRealUserInMock && supaUser
      ? [{ id: supaUser.id, name: displayName, initials: displayInitials, role: "member" }]
      : []),
    ...MOCK_USERS,
  ];

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

          {/* Weekly bar chart */}
          <Card className="border-border/60">
            <CardHeader className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[13px] font-semibold">Weekly Completion</CardTitle>
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md">This week</span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-end gap-1.5 h-24">
                {weekBars.map(({ day, done, total }) => {
                  const totalH = Math.round((total / maxTotal) * 100);
                  const doneH  = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1.5">
                      <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                        <div
                          className="relative w-full rounded-sm overflow-hidden bg-muted/70"
                          style={{ height: `${totalH}%`, minHeight: 4 }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm transition-all"
                            style={{ height: `${doneH}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground/70">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-primary inline-block" />Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-muted-foreground/20 inline-block" />Total
                </span>
              </div>
            </CardContent>
          </Card>

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
                  <div className="flex flex-col items-center py-10 gap-3 text-muted-foreground">
                    <span className="text-[13px]">No tasks yet</span>
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
