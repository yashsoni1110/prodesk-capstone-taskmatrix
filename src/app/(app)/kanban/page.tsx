"use client";

import { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { NewTaskDialog } from "@/components/new-task-dialog";
import { EditTaskDialog } from "@/components/edit-task-dialog";
import {
  MoreHorizontal, Clock, MessageSquare,
  AlertCircle, CheckCircle2, Circle, Plus,
  Layers, Eye,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTasks, useTaskActions } from "@/store/task-store";
import type { Task, TaskStatus } from "@/lib/data";

/* ── Column config ─────────────────────────────────────────────────────────── */
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

/* ── Task Card ──────────────────────────────────────────────────────────────── */
function TaskCard({
  taskId,
  index,
  onEdit,
}: {
  taskId: string;
  index: number;
  onEdit: (task: Task) => void;
}) {
  const task = useTasks().find((t) => t.id === taskId);
  const { deleteTask, updateTask } = useTaskActions();

  if (!task) return null;

  const grad = ROLE_GRAD[task.assignee.role] ?? "from-primary to-violet-600";

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group">
          <div
            className={[
              "rounded-lg border bg-card p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing select-none transition-all duration-150",
              snapshot.isDragging
                ? "shadow-2xl ring-2 ring-primary/40 scale-[1.02] rotate-[0.5deg] border-primary/30"
                : "border-border/50 hover:border-border hover:shadow-md",
            ].join(" ")}
          >
            {/* Priority + menu */}
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${PRIORITY_STYLES[task.priority]}`}>
                <span className={`w-1 h-1 rounded-full ${
                  task.priority === "critical" ? "bg-red-400" :
                  task.priority === "high"     ? "bg-amber-400" :
                  task.priority === "medium"   ? "bg-blue-400" : "bg-slate-400"
                }`} />
                {task.priority}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="opacity-0 group-hover:opacity-100 transition-opacity rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted"
                  id={`task-menu-${task.id}`}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => onEdit(task)} id={`edit-task-${task.id}`}>
                    Edit task
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => updateTask(task.id, { status: "todo" })}>
                    Move → To Do
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => updateTask(task.id, { status: "in-progress" })}>
                    Move → In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => updateTask(task.id, { status: "review" })}>
                    Move → Review
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => updateTask(task.id, { status: "done" })}>
                    Move → Done
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => deleteTask(task.id)}
                    id={`delete-task-${task.id}`}
                  >
                    Delete task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title — click to edit */}
            <p
              className="text-[13px] font-semibold leading-snug cursor-pointer hover:text-primary transition-colors"
              onClick={() => onEdit(task)}
            >
              {task.title}
            </p>

            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground/70">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" strokeWidth={1.6} />
                  {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {task.comments > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" strokeWidth={1.6} /> {task.comments}
                  </span>
                )}
              </div>
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-background shrink-0`}
                title={task.assignee.name}
              >
                {task.assignee.initials}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}

/* ── Column ──────────────────────────────────────────────────────────────────── */
function KanbanColumn({
  col,
  onEdit,
}: {
  col: (typeof COLUMNS)[number];
  onEdit: (task: Task) => void;
}) {
  const columnTasks = useTasks().filter((t) => t.status === col.id);
  const Icon = col.icon;

  return (
    <div className="flex flex-col min-w-0 min-w-[220px]">
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg mb-2 ${col.header}`}>
        <Icon className={`w-3.5 h-3.5 ${col.accent} shrink-0`} strokeWidth={1.8} />
        <span className="text-[12px] font-semibold flex-1">{col.label}</span>
        <span className={`text-[11px] font-bold tabular-nums ${col.accent}`}>{columnTasks.length}</span>
        <NewTaskDialog defaultStatus={col.id} triggerLabel="" />
      </div>

      <Droppable droppableId={col.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={[
              "flex-1 min-h-[280px] rounded-lg p-1.5 space-y-2 transition-all duration-150",
              snapshot.isDraggingOver ? `ring-2 ${col.ring} bg-muted/50` : "bg-muted/15",
            ].join(" ")}
          >
            {columnTasks.map((task, i) => (
              <TaskCard key={task.id} taskId={task.id} index={i} onEdit={onEdit} />
            ))}
            {provided.placeholder}

            {columnTasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-24 gap-2 cursor-pointer group" onClick={() => {}}>
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center group-hover:bg-muted/70 transition-colors">
                  <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <span className="text-[11px] text-muted-foreground/60">{col.emptyText}</span>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}

/* ── Summary bar ────────────────────────────────────────────────────────────── */
function BoardSummary() {
  const tasks  = useTasks();
  const total  = tasks.length;
  const done   = tasks.filter((t) => t.status === "done").length;
  const pct    = total > 0 ? Math.round((done / total) * 100) : 0;

  const counts = [
    { label: "Total",       val: total,                                                  dot: "bg-slate-400"   },
    { label: "Backlog",     val: tasks.filter((t) => t.status === "backlog").length,     dot: "bg-slate-500"   },
    { label: "To Do",       val: tasks.filter((t) => t.status === "todo").length,        dot: "bg-blue-500"    },
    { label: "In Progress", val: tasks.filter((t) => t.status === "in-progress").length, dot: "bg-violet-500"  },
    { label: "Review",      val: tasks.filter((t) => t.status === "review").length,      dot: "bg-amber-500"   },
    { label: "Done",        val: done,                                                   dot: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2.5 rounded-lg border border-border/50 bg-card text-[11px] text-muted-foreground">
      {counts.map(({ label, val, dot }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
          <span className="font-medium">{val}</span> {label}
        </span>
      ))}
      <span className="ml-auto text-[12px] text-primary font-semibold">{pct}% complete</span>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function KanbanBoard() {
  const { moveTask, reorderTasks } = useTaskActions();
  const [editTask, setEditTask] = useState<Task | null>(null);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const sameCol   = destination.droppableId === source.droppableId;
    const sameIndex = destination.index === source.index;
    if (sameCol && sameIndex) return;
    if (sameCol) {
      reorderTasks(source.droppableId as TaskStatus, source.index, destination.index);
    } else {
      moveTask(draggableId, destination.droppableId as TaskStatus);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Drag cards between columns · click a card to edit
          </p>
        </div>
        <NewTaskDialog />
      </div>

      {/* Summary */}
      <BoardSummary />

      {/* Board — horizontally scrollable on small screens */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4 flex-1">
          {COLUMNS.map((col) => (
            <div key={col.id} className="flex-1 min-w-[200px] max-w-[280px] flex flex-col">
              <KanbanColumn col={col} onEdit={setEditTask} />
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Edit Task Modal */}
      {editTask && (
        <EditTaskDialog
          task={editTask}
          open={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
