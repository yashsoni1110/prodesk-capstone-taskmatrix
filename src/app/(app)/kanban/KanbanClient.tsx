"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { DropResult } from "@hello-pangea/dnd";
import {
  MoreHorizontal, Clock, MessageSquare,
  AlertCircle, CheckCircle2, Circle, Plus,
  Layers, Eye, FolderKanban, ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks, useTaskActions } from "@/store/task-store";
import { useProjects, useProjectActions } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import type { Task, TaskStatus } from "@/lib/data";
import { toast } from "sonner";
import Link from "next/link";

// Lazy-load heavier DnD components
const DragDropContext = dynamic(() => import("@hello-pangea/dnd").then(m => m.DragDropContext), { ssr: false });
const Droppable = dynamic(() => import("@hello-pangea/dnd").then(m => m.Droppable), { ssr: false });
const Draggable = dynamic(() => import("@hello-pangea/dnd").then(m => m.Draggable), { ssr: false });

// Lazy-load dialogs
const NewTaskDialog = dynamic(() => import("@/components/new-task-dialog").then(m => m.NewTaskDialog), { ssr: false });
const EditTaskDialog = dynamic(() => import("@/components/edit-task-dialog").then(m => m.EditTaskDialog), { ssr: false });
const ConfirmDeleteDialog = dynamic(() => import("@/components/confirm-delete-dialog").then(m => m.ConfirmDeleteDialog), { ssr: false });

const COLUMNS: {
  id: TaskStatus;
  label: string;
  icon: React.ElementType;
  accent: string;
  header: string;
  ring: string;
  emptyText: string;
}[] = [
  { id: "backlog",     label: "Backlog",     icon: Layers,       accent: "text-slate-400",   header: "bg-slate-500/8",   ring: "ring-slate-500/20",   emptyText: "No backlog items"    },
  { id: "todo",        label: "To Do",       icon: Circle,       accent: "text-blue-400",    header: "bg-blue-500/8",    ring: "ring-blue-500/20",    emptyText: "No tasks queued"     },
  { id: "in-progress", label: "In Progress", icon: AlertCircle,  accent: "text-violet-400",  header: "bg-violet-500/8",  ring: "ring-violet-500/20",  emptyText: "Nothing in progress" },
  { id: "review",      label: "Review",      icon: Eye,          accent: "text-amber-400",   header: "bg-amber-500/8",   ring: "ring-amber-500/20",   emptyText: "Nothing in review"   },
  { id: "done",        label: "Done",        icon: CheckCircle2, accent: "text-emerald-400", header: "bg-emerald-500/8", ring: "ring-emerald-500/20", emptyText: "No completed tasks"  },
];

const PRIORITY_STYLES = {
  low:      "bg-slate-500/10  text-slate-400  border-slate-500/20",
  medium:   "bg-blue-500/10   text-blue-400   border-blue-500/20",
  high:     "bg-amber-500/10  text-amber-400  border-amber-500/20",
  critical: "bg-red-500/10    text-red-400    border-red-500/20",
} as const;

const ROLE_GRAD: Record<string, string> = {
  admin:     "from-violet-500 to-purple-600",
  manager:   "from-blue-500   to-cyan-600",
  developer: "from-emerald-500 to-teal-600",
  designer:  "from-pink-500   to-rose-600",
};

const TaskCard = memo(function TaskCard({
  taskId,
  index,
  onEdit,
  onDelete,
  projectName,
  projectColor,
}: {
  taskId: string;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  projectName?: string;
  projectColor?: string;
}) {
  const task = useTasks().find((t) => t.id === taskId);
  const { updateTask } = useTaskActions();
  if (!task) return null;
  const grad = ROLE_GRAD[task.assignee.role] ?? "from-primary to-violet-600";
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group">
          <div className={`rounded-lg border bg-card p-3.5 space-y-2.5 transition-all ${snapshot.isDragging ? "shadow-2xl ring-2 ring-primary/40 border-primary/30" : "border-border/50"}`}>
             <div className="flex items-start justify-between gap-2">
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
             <p className="text-[13px] font-semibold leading-snug">{task.title}</p>
             <div className="flex items-center justify-between pt-0.5">
                <span className="text-[11px] text-muted-foreground/70">{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-[8px] text-white ring-2 ring-background`}>{task.assignee.initials}</div>
             </div>
          </div>
        </div>
      )}
    </Draggable>
  );
});

const KanbanColumn = memo(function KanbanColumn({ col, onEdit, onDelete, filterProjectId, projects }: any) {
  const allTasks = useTasks();
  const columnTasks = useMemo(() => allTasks.filter(t => t.status === col.id && (!filterProjectId || t.projectId === filterProjectId)), [allTasks, col.id, filterProjectId]);
  const Icon = col.icon;
  return (
    <div className="flex flex-col min-w-0">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-2 ${col.header}`}>
        <Icon className={`w-3.5 h-3.5 ${col.accent}`} />
        <span className="text-[12px] font-semibold flex-1">{col.label}</span>
        <span className={`text-[11px] font-bold ${col.accent}`}>{columnTasks.length}</span>
      </div>
      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 min-h-[280px] rounded-lg p-1.5 space-y-2 transition-colors ${snapshot.isDraggingOver ? `ring-2 ${col.ring} bg-muted/50` : "bg-muted/15"}`}>
            {columnTasks.map((task, i) => <TaskCard key={task.id} taskId={task.id} index={i} onEdit={onEdit} onDelete={onDelete} />)}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

export function KanbanClient() {
  const { moveTask, reorderTasks, deleteTask, fetchTasks } = useTaskActions();
  const { fetchProjects } = useProjectActions();
  const supabaseUser = useAuthStore(s => s.supabaseUser);
  const projects = useProjects();
  const searchParams = useSearchParams();
  const filterProjectId = searchParams.get("project");
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (supabaseUser?.id) {
      fetchTasks(supabaseUser.id);
      fetchProjects(supabaseUser.id);
    }
  }, [supabaseUser?.id, fetchTasks, fetchProjects]);

  const activeProject = useMemo(() => filterProjectId ? projects.find(p => p.id === filterProjectId) ?? null : null, [filterProjectId, projects]);

  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) {
      reorderTasks(source.droppableId as TaskStatus, source.index, destination.index);
    } else {
      moveTask(draggableId, destination.droppableId as TaskStatus);
    }
  }, [reorderTasks, moveTask]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-up">
        <div>
           {activeProject && (
             <div className="flex items-center gap-2 mb-1">
               <Link href="/projects" className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"><ArrowLeft className="w-3 h-3" /> Projects</Link>
               <span className="text-muted-foreground/30">/</span>
               <span className="text-[12px] font-semibold" style={{ color: activeProject.color }}>{activeProject.name}</span>
             </div>
           )}
           <h1 className="text-xl font-semibold tracking-tight">{activeProject ? `${activeProject.name} Board` : "Tasks"}</h1>
        </div>
        <NewTaskDialog defaultProjectId={filterProjectId ?? ""} />
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map(col => (
            <div key={col.id} className="flex-none w-[240px] sm:flex-1 sm:min-w-[200px] sm:max-w-[280px]">
              <KanbanColumn col={col} filterProjectId={filterProjectId} projects={projects} />
            </div>
          ))}
        </div>
      </DragDropContext>

      {editTask && <EditTaskDialog task={editTask} open={!!editTask} onClose={() => setEditTask(null)} />}
      <ConfirmDeleteDialog open={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)} onConfirm={() => { deleteTask(confirmDeleteId!); setConfirmDeleteId(null); }} title="Delete Task" description="Permanently delete this task?" isDeleting={false} />
    </div>
  );
}
