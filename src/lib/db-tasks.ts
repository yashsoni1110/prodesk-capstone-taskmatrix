import { supabase } from "@/lib/supabase";
import type { Task } from "@/lib/data";

// ── Row shape coming back from Supabase ────────────────────────────────────────
interface TaskRow {
  id: string;
  user_id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  project_id: string;
  due_date: string | null;
  tags: string[];
  assignee_name: string;
  assignee_initials: string;
  assignee_role: string;
  created_at: string;
}

/** Map a Supabase row → local Task shape */
function rowToTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    status: row.status as Task["status"],
    priority: row.priority as Task["priority"],
    projectId: row.project_id ?? "p1",
    dueDate: row.due_date
      ? new Date(row.due_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    tags: row.tags ?? [],
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    comments: 0,
    attachments: 0,
    assignee: {
      id: row.user_id,
      name: row.assignee_name ?? "You",
      initials: row.assignee_initials ?? "YO",
      role: (row.assignee_role as Task["assignee"]["role"]) ?? "developer",
      email: "",
      avatar: "",
    },
  };
}

/** Fetch all tasks belonging to a user, ordered by creation time */
export async function fetchTasksFromDB(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[db-tasks] fetchTasksFromDB error:", error.message);
    return [];
  }
  return (data as TaskRow[]).map(rowToTask);
}

/** Returns true if the string is a valid UUID (v4) */
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** Insert a new task row; returns the DB-generated UUID on success */
export async function createTaskInDB(
  userId: string,
  task: Task
): Promise<string | null> {
  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: userId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        // Only pass project_id if it looks like a real UUID (not mock "p1", "p2" etc.)
        project_id: task.projectId && isValidUUID(task.projectId) ? task.projectId : null,
        due_date: task.dueDate,
        tags: task.tags,
        assignee_name: task.assignee.name,
        assignee_initials: task.assignee.initials,
        assignee_role: task.assignee.role,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[db-tasks] createTaskInDB error:", error.message);
    return null;
  }
  return (data as { id: string }).id;
}

/** Update specific fields on an existing task row */
export async function updateTaskInDB(
  taskId: string,
  changes: Partial<Task>
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (changes.title !== undefined) patch.title = changes.title;
  if (changes.description !== undefined) patch.description = changes.description;
  if (changes.status !== undefined) patch.status = changes.status;
  if (changes.priority !== undefined) patch.priority = changes.priority;
  if (changes.projectId !== undefined) patch.project_id = changes.projectId;
  if (changes.dueDate !== undefined) patch.due_date = changes.dueDate;
  if (changes.tags !== undefined) patch.tags = changes.tags;
  if (changes.assignee !== undefined) {
    patch.assignee_name = changes.assignee.name;
    patch.assignee_initials = changes.assignee.initials;
    patch.assignee_role = changes.assignee.role;
  }

  const { error } = await supabase.from("tasks").update(patch).eq("id", taskId);

  if (error) {
    console.error("[db-tasks] updateTaskInDB error:", error.message);
    return false;
  }
  return true;
}

/** Permanently delete a task row */
export async function deleteTaskFromDB(taskId: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("[db-tasks] deleteTaskFromDB error:", error.message);
    return false;
  }
  return true;
}
