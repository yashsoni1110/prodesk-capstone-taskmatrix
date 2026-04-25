import { create } from "zustand";
import { MOCK_USERS } from "@/lib/data";
import type { Project, User } from "@/lib/data";
import {
  fetchProjectsFromDB,
  createProjectInDB,
  deleteProjectFromDB,
  updateProjectInDB,
} from "@/lib/db-projects";

// ── Input types ───────────────────────────────────────────────────────────────

export interface NewProjectInput {
  name: string;
  description?: string;
  color?: string;
  dueDate?: string;
  members?: User[];
  memberIds?: string[];
}

export type UpdateProjectInput = Partial<
  Omit<Project, "id" | "createdAt" | "members">
> & { memberIds?: string[] };

// ── Store shape ───────────────────────────────────────────────────────────────

export interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  /** Tracks the userId whose projects are currently loaded. */
  loadedForUserId: string | null;
  fetchProjects: (userId: string) => Promise<void>;
  addProject:    (input: NewProjectInput, userId?: string) => Project;
  updateProject: (id: string, changes: UpdateProjectInput) => boolean;
  deleteProject: (id: string) => boolean;
  addMember:     (projectId: string, userId: string) => void;
  removeMember:  (projectId: string, userId: string) => void;
  /** Clear all projects (used on logout). */
  clearProjects: () => void;
}

// ── ID counter ────────────────────────────────────────────────────────────────
let _pCounter = 1;
const nextProjectId = () => `proj_${Date.now()}_${_pCounter++}`;

// ── PROJECT_COLORS ────────────────────────────────────────────────────────────
export const PROJECT_COLORS = [
  "#7c3aed",
  "#0891b2",
  "#be185d",
  "#15803d",
  "#b45309",
  "#1d4ed8",
  "#dc2626",
  "#9333ea",
] as const;

// ── Store ─────────────────────────────────────────────────────────────────────
export const useProjectStore = create<ProjectStore>()((set, get) => ({
  projects: [],
  isLoading: false,
  loadedForUserId: null,

  // ── fetchProjects ────────────────────────────────────────────────────────────
  async fetchProjects(userId) {
    set({ isLoading: true });
    const remote = await fetchProjectsFromDB(userId);
    // Always replace — empty array is valid for a new user
    set({ projects: remote, isLoading: false, loadedForUserId: userId });
  },

  // ── addProject ───────────────────────────────────────────────────────────────
  addProject(input, userId) {
    const members: User[] = input.members
      ? input.members
      : (input.memberIds ?? ["u1"])
          .map((id) => MOCK_USERS.find((u) => u.id === id))
          .filter(Boolean) as User[];

    const project: Project = {
      id: nextProjectId(),
      name: input.name,
      description: input.description ?? "",
      color:
        input.color ??
        PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)],
      progress: 0,
      taskCount: 0,
      members,
      createdAt: new Date().toISOString().split("T")[0],
      dueDate:
        input.dueDate ??
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
    };

    set((state) => ({ projects: [...state.projects, project] }));

    // Persist in background
    if (userId) {
      createProjectInDB(userId, project).then((dbId) => {
        // Swap the temp local id with the DB-generated UUID
        if (dbId && dbId !== project.id) {
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === project.id ? { ...p, id: dbId } : p
            ),
          }));
        }
      }).catch(() => {});
    }

    return project;
  },

  // ── updateProject ────────────────────────────────────────────────────────────
  updateProject(id, changes) {
    let found = false;
    set((state) => {
      const next = state.projects.map((p) => {
        if (p.id !== id) return p;
        found = true;
        const members = changes.memberIds
          ? (changes.memberIds
              .map((uid) => MOCK_USERS.find((u) => u.id === uid))
              .filter(Boolean) as User[])
          : p.members;
        const { memberIds: _m, ...rest } = changes;
        void _m;
        return { ...p, ...rest, members };
      });
      return { projects: next };
    });

    if (found) {
      updateProjectInDB(id, changes as Partial<Project>).catch(() => {});
    }

    return found;
  },

  // ── deleteProject ─────────────────────────────────────────────────────────────
  deleteProject(id) {
    const exists = get().projects.some((p) => p.id === id);
    if (!exists) return false;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));

    // Persist in background
    deleteProjectFromDB(id).catch(() => {});

    return true;
  },

  addMember(projectId, userId) {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (!user) return;
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id !== projectId) return p;
        if (p.members.some((m) => m.id === userId)) return p;
        return { ...p, members: [...p.members, user] };
      }),
    }));
  },

  removeMember(projectId, userId) {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, members: p.members.filter((m) => m.id !== userId) }
          : p
      ),
    }));
  },

  // ── clearProjects ────────────────────────────────────────────────────────────
  clearProjects() {
    set({ projects: [], loadedForUserId: null });
  },
}));

// ── Selector hooks ────────────────────────────────────────────────────────────

export const useProjects = () => useProjectStore((s) => s.projects);
export const useProjectsLoading = () => useProjectStore((s) => s.isLoading);
export const useProject = (id: string) =>
  useProjectStore((s) => s.projects.find((p) => p.id === id));

export function useProjectActions() {
  const addProject    = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const addMember     = useProjectStore((s) => s.addMember);
  const removeMember  = useProjectStore((s) => s.removeMember);
  const clearProjects = useProjectStore((s) => s.clearProjects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  return { addProject, updateProject, deleteProject, addMember, removeMember, clearProjects, fetchProjects };
}
