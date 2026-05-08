"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
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
  TrendingUp, FolderKanban, Pencil, AlertCircle,
} from "lucide-react";
import { useProjects, useProjectActions } from "@/store/project-store";
import { useTasks } from "@/store/task-store";
import { useAuthStore } from "@/store/auth-store";
import type { Project } from "@/lib/data";
import { toast } from "sonner";

// Lazy-load dialogs
const NewProjectDialog = dynamic(
  () => import("@/components/new-project-dialog").then((m) => ({ default: m.NewProjectDialog })),
  { ssr: false }
);
const EditProjectDialog = dynamic(
  () => import("@/components/edit-project-dialog").then((m) => ({ default: m.EditProjectDialog })),
  { ssr: false }
);
const ConfirmDeleteDialog = dynamic(
  () => import("@/components/confirm-delete-dialog").then((m) => ({ default: m.ConfirmDeleteDialog })),
  { ssr: false }
);

export function ProjectsClient() {
  const projects = useProjects();
  const tasks    = useTasks();
  const { deleteProject, fetchProjects } = useProjectActions();
  const supabaseUser = useAuthStore((s) => s.supabaseUser);
  const router   = useRouter();
  
  const [search, setSearch] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting,      setIsDeleting]      = useState(false);
  const [editProject,     setEditProject]     = useState<Project | null>(null);

  useEffect(() => {
    if (supabaseUser?.id) {
      fetchProjects(supabaseUser.id);
    }
  }, [supabaseUser?.id, fetchProjects]);

  const filtered = useMemo(() => 
    projects.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    ),
    [projects, search]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmDeleteId) return;
    setIsDeleting(true);
    deleteProject(confirmDeleteId);
    await new Promise((r) => setTimeout(r, 400));
    setIsDeleting(false);
    setConfirmDeleteId(null);
    toast.error("🗑️ Project deleted");
  }, [confirmDeleteId, deleteProject]);

  const totalTasks    = tasks.length;
  const doneTasks     = useMemo(() => tasks.filter((t) => t.status === "done").length, [tasks]);
  const avgProgress   = useMemo(() => projects.length
    ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
    : 0, [projects]);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} active projects · {totalTasks} total tasks
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
            <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div>
              <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search projects…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-muted/40 border-transparent focus-visible:border-border focus-visible:bg-background"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.map((project) => {
          const projectTasks = tasks.filter((t) => t.projectId === project.id);
          const done = projectTasks.filter((t) => t.status === "done").length;
          const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : project.progress;

          return (
            <Card
              key={project.id}
              onClick={() => router.push(`/kanban?project=${project.id}`)}
              className="group border-border/50 hover:border-primary/40 transition-all cursor-pointer"
            >
              <div className="h-1 w-full" style={{ backgroundColor: project.color }} />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ backgroundColor: project.color }}>
                    {project.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{project.name}</h2>
                    <p className="text-xs text-muted-foreground line-clamp-1">{project.description}</p>
                  </div>
                </div>
                <Progress value={pct} className="h-1.5" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editProject && (
        <EditProjectDialog project={editProject} open={!!editProject} onClose={() => setEditProject(null)} />
      )}
      <ConfirmDeleteDialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} onConfirm={handleDeleteConfirm} title="Delete Project" description="Permanently remove this project?" isDeleting={isDeleting} />
    </div>
  );
}
