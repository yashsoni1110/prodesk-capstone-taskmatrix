import { create } from "zustand";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data";
import type { Task, TaskStatus, Priority } from "@/lib/data";
import {
  fetchTasksFromDB,
  createTaskInDB,
  updateTaskInDB,
  deleteTaskFromDB,
} from "@/lib/db-tasks";

// ── Input type for creating a new task ────────────────────────────────────────
export interface NewTaskInput {
  title: string;
  status?: TaskStatus;
  priority?: Priority;
  assigneeId?: string;
  projectId?: string;
  dueDate?: string;
  tags?: string[];
  description?: string;
}

// ── Input type for updating an existing task ──────────────────────────────────
export type UpdateTaskInput = Partial<Omit<Task, "id" | "createdAt">>;

// ── Store shape ───────────────────────────────────────────────────────────────
export interface TaskStore {
  tasks: Task[];
  isLoading: boolean;
  isSaving: boolean;

  // ── CRUD actions ─────────────────────────────────────────────────────────────

  /** Fetch tasks from Supabase for the given user. */
  fetchTasks: (userId: string) => Promise<void>;

  /**
   * Add a brand-new task.
   * Pass userId to also persist to Supabase in the background.
   */
  addTask: (input: NewTaskInput, userId?: string) => Task;

  /**
   * Partially update fields on an existing task by id.
   * Also syncs to Supabase in the background.
   */
  updateTask: (id: string, changes: UpdateTaskInput) => boolean;

  /**
   * Remove a task by id.
   * Also deletes from Supabase in the background.
   */
  deleteTask: (id: string) => boolean;

  // ── Convenience helpers ──────────────────────────────────────────────────────

  moveTask: (id: string, status: TaskStatus) => void;
  reorderTasks: (
    columnId: TaskStatus,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
  getByStatus: (status: TaskStatus) => Task[];
  resetToMock: () => void;
}

// ── Counter for generating local temp ids ─────────────────────────────────────
let _idCounter = MOCK_TASKS.length + 1;
function nextId(): string {
  return `t${_idCounter++}`;
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: MOCK_TASKS,
  isLoading: false,
  isSaving: false,

  // ── fetchTasks ───────────────────────────────────────────────────────────────
  async fetchTasks(userId) {
    set({ isLoading: true });
    const remote = await fetchTasksFromDB(userId);
    if (remote.length > 0) {
      set({ tasks: remote, isLoading: false });
    } else {
      // No data in Supabase yet — keep mock data so UI is never blank
      set({ isLoading: false });
    }
  },

  // ── addTask ──────────────────────────────────────────────────────────────────
  addTask(input, userId) {
    const assignee =
      MOCK_USERS.find((u) => u.id === (input.assigneeId ?? "u1")) ??
      MOCK_USERS[0];

    const newTask: Task = {
      id: nextId(),
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      assignee,
      projectId: input.projectId ?? "p1",
      dueDate:
        input.dueDate ??
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      tags: input.tags ?? [],
      createdAt: new Date().toISOString().split("T")[0],
      comments: 0,
      attachments: 0,
    };

    set((state) => ({ tasks: [...state.tasks, newTask] }));

    // Persist to Supabase in the background (non-blocking)
    if (userId) {
      createTaskInDB(userId, newTask).catch(() => {
        // silently fail — user still sees the local state
      });
    }

    return newTask;
  },

  // ── updateTask ───────────────────────────────────────────────────────────────
  updateTask(id, changes) {
    let found = false;
    set((state) => {
      const nextTasks = state.tasks.map((t) => {
        if (t.id !== id) return t;
        found = true;
        const resolvedAssignee =
          (changes as { assigneeId?: string }).assigneeId
            ? MOCK_USERS.find(
                (u) =>
                  u.id === (changes as { assigneeId?: string }).assigneeId
              ) ?? t.assignee
            : changes.assignee ?? t.assignee;
        return { ...t, ...changes, assignee: resolvedAssignee };
      });
      return { tasks: nextTasks };
    });

    // Persist to Supabase in the background
    if (found) {
      updateTaskInDB(id, changes as Partial<Task>).catch(() => {});
    }

    return found;
  },

  // ── deleteTask ───────────────────────────────────────────────────────────────
  deleteTask(id) {
    const exists = get().tasks.some((t) => t.id === id);
    if (!exists) return false;
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));

    // Persist to Supabase in the background
    deleteTaskFromDB(id).catch(() => {});

    return true;
  },

  // ── moveTask ─────────────────────────────────────────────────────────────────
  moveTask(id, status) {
    get().updateTask(id, { status });
  },

  // ── reorderTasks ─────────────────────────────────────────────────────────────
  reorderTasks(columnId, sourceIndex, destinationIndex) {
    set((state) => {
      const columnTasks = state.tasks
        .filter((t) => t.status === columnId)
        .slice();
      const otherTasks = state.tasks.filter((t) => t.status !== columnId);
      const [moved] = columnTasks.splice(sourceIndex, 1);
      columnTasks.splice(destinationIndex, 0, moved);
      return { tasks: [...otherTasks, ...columnTasks] };
    });
  },

  // ── getByStatus ──────────────────────────────────────────────────────────────
  getByStatus(status) {
    return get().tasks.filter((t) => t.status === status);
  },

  // ── resetToMock ──────────────────────────────────────────────────────────────
  resetToMock() {
    set({ tasks: MOCK_TASKS });
  },
}));

// ── Typed selector hooks ───────────────────────────────────────────────────────

export const useTasks = () => useTaskStore((s) => s.tasks);
export const useTasksLoading = () => useTaskStore((s) => s.isLoading);
export const useTasksByStatus = (status: TaskStatus) =>
  useTaskStore((s) => s.tasks.filter((t) => t.status === status));
export const useTask = (id: string) =>
  useTaskStore((s) => s.tasks.find((t) => t.id === id));

export function useTaskActions() {
  const addTask      = useTaskStore((s) => s.addTask);
  const updateTask   = useTaskStore((s) => s.updateTask);
  const deleteTask   = useTaskStore((s) => s.deleteTask);
  const moveTask     = useTaskStore((s) => s.moveTask);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const resetToMock  = useTaskStore((s) => s.resetToMock);
  const fetchTasks   = useTaskStore((s) => s.fetchTasks);
  return { addTask, updateTask, deleteTask, moveTask, reorderTasks, resetToMock, fetchTasks };
}
