"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, CalendarDays, CheckSquare, Search,
  MoreHorizontal, Trash2, ExternalLink, Users,
  TrendingUp, FolderKanban,
} from "lucide-react";
import Link from "next/link";
import { useProjects, useProjectActions } from "@/store/project-store";
import { useTasks } from "@/store/task-store";
import { NewProjectDialog } from "@/components/new-project-dialog";

export default function ProjectsPage() {
  const projects = useProjects();
  const tasks    = useTasks();
  const { deleteProject } = useProjectActions();

  const [search, setSearch] = useState("");

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  /* ── Summary stats ── */
  const totalTasks    = tasks.length;
  const doneTasks     = tasks.filter((t) => t.status === "done").length;
  const avgProgress   = projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0;

  return (
    <div className="space-y-6 max-w-[1200px]">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} active project{projects.length !== 1 ? "s" : ""} · {totalTasks} total tasks
          </p>
        </div>
        <NewProjectDialog />
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Projects",     value: projects.length, icon: FolderKanban, color: "text-primary",    bg: "bg-primary/10"       },
          { label: "Total Tasks",  value: totalTasks,       icon: CheckSquare,  color: "text-blue-400",   bg: "bg-blue-500/10"      },
          { label: "Completed",    value: doneTasks,        icon: TrendingUp,   color: "text-emerald-400",bg: "bg-emerald-500/10"   },
          { label: "Avg Progress", value: `${avgProgress}%`,icon: Users,        color: "text-violet-400", bg: "bg-violet-500/10"    },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card">
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          id="project-search"
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:border-border focus-visible:bg-background focus-visible:ring-0"
        />
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <FolderKanban className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search ? `No projects matching "${search}"` : "No projects yet"}
          </p>
          {!search && <NewProjectDialog />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const done         = projectTasks.filter((t) => t.status === "done").length;
            const inProgress   = projectTasks.filter((t) => t.status === "in-progress").length;
            const pct          = projectTasks.length > 0
              ? Math.round((done / projectTasks.length) * 100)
              : project.progress;

            return (
              <Card
                key={project.id}
                id={`project-card-${project.id}`}
                className="group border-border/50 hover:border-border hover:shadow-md transition-all duration-150 overflow-hidden"
              >
                {/* Color accent bar */}
                <div className="h-1 w-full" style={{ backgroundColor: project.color }} />

                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-white text-base font-bold shadow-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {project.name}
                      </h2>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {project.description || "No description"}
                      </p>
                    </div>

                    {/* Progress badge + menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-semibold"
                        style={{
                          borderColor: project.color + "60",
                          color: project.color,
                          backgroundColor: project.color + "15",
                        }}
                      >
                        {pct}%
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                          id={`project-menu-${project.id}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem>
                            <Link href="/kanban" className="flex items-center gap-2 w-full">
                              <ExternalLink className="w-3.5 h-3.5" /> Open Board
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => deleteProject(project.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Progress</span>
                      <span>{done} / {projectTasks.length || project.taskCount} tasks done</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5" />
                      {projectTasks.length || project.taskCount} tasks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" />
                      Due {project.dueDate}
                    </span>
                    {inProgress > 0 && (
                      <span className="flex items-center gap-1.5 text-violet-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {inProgress} active
                      </span>
                    )}
                  </div>

                  {/* Members + CTA */}
                  <div className="flex items-center justify-between pt-0.5">
                    <div className="flex items-center">
                      {project.members.slice(0, 5).map((member) => (
                        <Avatar
                          key={member.id}
                          className="h-7 w-7 -ml-2 first:ml-0 border-2 border-card"
                          title={member.name}
                        >
                          <AvatarFallback className="text-[9px] font-bold bg-gradient-to-br from-primary to-violet-600 text-white">
                            {member.initials}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.members.length > 5 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          +{project.members.length - 5}
                        </span>
                      )}
                      {project.members.length === 0 && (
                        <span className="text-xs text-muted-foreground">No members</span>
                      )}
                    </div>

                    <Link href="/kanban" id={`open-board-${project.id}-link`}>
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                        <ExternalLink className="w-3 h-3" /> Open Board
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Add project card */}
          <div className="border-2 border-dashed border-border/50 hover:border-primary/40 rounded-xl flex items-center justify-center p-8 transition-colors group">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors mb-1">
                New Project
              </p>
              <NewProjectDialog />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
