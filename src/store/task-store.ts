import { create } from "zustand";
import { MOCK_TASKS, MOCK_USERS } from "@/lib/data";
import type { Task, TaskStatus, Priority } from "@/lib/data";

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
  /** Flat list of all tasks */
  tasks: Task[];

  // ── CRUD actions ────────────────────────────────────────────────────────────

  /**
   * Add a brand-new task.
   * Generates a unique id and createdAt automatically.
   */
  addTask: (input: NewTaskInput) => Task;

  /**
   * Partially update fields on an existing task by id.
   * Returns true if the task was found and updated, false otherwise.
   */
  updateTask: (id: string, changes: UpdateTaskInput) => boolean;

  /**
   * Remove a task by id.
   * Returns true if found and deleted, false otherwise.
   */
  deleteTask: (id: string) => boolean;

  // ── Convenience helpers ───────────────────────────────────────────────────

  /** Move a task to a different status column. */
  moveTask: (id: string, status: TaskStatus) => void;

  /** Reorder tasks within a column after a drag-and-drop. */
  reorderTasks: (
    columnId: TaskStatus,
    sourceIndex: number,
    destinationIndex: number
  ) => void;

  /** Get tasks belonging to a specific status column. */
  getByStatus: (status: TaskStatus) => Task[];

  /** Wipe all tasks and reload from mock data (useful for dev/reset). */
  resetToMock: () => void;
}

// ── Counter for generating unique ids (survives store resets inside session) ──
let _idCounter = MOCK_TASKS.length + 1;

function nextId(): string {
  return `t${_idCounter++}`;
}

// ── Store (no persist/devtools — avoids SSR hydration mismatch) ───────────────
export const useTaskStore = create<TaskStore>()(
  (set, get) => ({
    tasks: MOCK_TASKS,

    addTask(input) {
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
      return newTask;
    },

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
      return found;
    },

    deleteTask(id) {
      const exists = get().tasks.some((t) => t.id === id);
      if (!exists) return false;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      return true;
    },

    moveTask(id, status) {
      get().updateTask(id, { status });
    },

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

    getByStatus(status) {
      return get().tasks.filter((t) => t.status === status);
    },

    resetToMock() {
      set({ tasks: MOCK_TASKS });
    },
  })
);

// ── Typed selector hooks ───────────────────────────────────────────────────────

/** Returns all tasks (re-renders only when tasks array reference changes). */
export const useTasks = () => useTaskStore((s) => s.tasks);

/** Returns tasks filtered by status. */
export const useTasksByStatus = (status: TaskStatus) =>
  useTaskStore((s) => s.tasks.filter((t) => t.status === status));

/** Returns a single task by id (or undefined). */
export const useTask = (id: string) =>
  useTaskStore((s) => s.tasks.find((t) => t.id === id));

/**
 * Returns action functions with stable references.
 * Each action is selected individually — Zustand store function refs
 * are stable (created once), so no new object is returned from the snapshot.
 */
export function useTaskActions() {
  const addTask      = useTaskStore((s) => s.addTask);
  const updateTask   = useTaskStore((s) => s.updateTask);
  const deleteTask   = useTaskStore((s) => s.deleteTask);
  const moveTask     = useTaskStore((s) => s.moveTask);
  const reorderTasks = useTaskStore((s) => s.reorderTasks);
  const resetToMock  = useTaskStore((s) => s.resetToMock);
  return { addTask, updateTask, deleteTask, moveTask, reorderTasks, resetToMock };
}
