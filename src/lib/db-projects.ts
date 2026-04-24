import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/data";

// ── Row shape from Supabase ────────────────────────────────────────────────────
interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  due_date: string | null;
  created_at: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    color: row.color ?? "#7c3aed",
    progress: row.progress ?? 0,
    taskCount: 0,
    members: [],
    createdAt: row.created_at
      ? new Date(row.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueDate: row.due_date
      ? new Date(row.due_date).toISOString().split("T")[0]
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
  };
}

/** Fetch all projects belonging to a user */
export async function fetchProjectsFromDB(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[db-projects] fetchProjectsFromDB error:", error.message);
    return [];
  }
  return (data as ProjectRow[]).map(rowToProject);
}

/** Insert a new project row; returns DB UUID on success */
export async function createProjectInDB(
  userId: string,
  project: Project
): Promise<string | null> {
  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        user_id: userId,
        name: project.name,
        description: project.description,
        color: project.color,
        progress: project.progress,
        due_date: project.dueDate,
      },
    ])
    .select("id")
    .single();

  if (error) {
    console.error("[db-projects] createProjectInDB error:", error.message);
    return null;
  }
  return (data as { id: string }).id;
}

/** Update specific fields on an existing project row */
export async function updateProjectInDB(
  projectId: string,
  changes: Partial<Project>
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patch: Record<string, any> = {};
  if (changes.name !== undefined) patch.name = changes.name;
  if (changes.description !== undefined) patch.description = changes.description;
  if (changes.color !== undefined) patch.color = changes.color;
  if (changes.progress !== undefined) patch.progress = changes.progress;
  if (changes.dueDate !== undefined) patch.due_date = changes.dueDate;

  const { error } = await supabase
    .from("projects")
    .update(patch)
    .eq("id", projectId);

  if (error) {
    console.error("[db-projects] updateProjectInDB error:", error.message);
    return false;
  }
  return true;
}

/** Permanently delete a project row */
export async function deleteProjectFromDB(projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error("[db-projects] deleteProjectFromDB error:", error.message);
    return false;
  }
  return true;
}
