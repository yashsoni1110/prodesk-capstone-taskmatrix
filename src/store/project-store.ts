import { create } from "zustand";
import { MOCK_PROJECTS, MOCK_USERS } from "@/lib/data";
import type { Project, User } from "@/lib/data";

// ── Input types ───────────────────────────────────────────────────────────────

export interface NewProjectInput {
  name: string;
  description?: string;
  color?: string;
  dueDate?: string;
  memberIds?: string[];
}

export type UpdateProjectInput = Partial<
  Omit<Project, "id" | "createdAt" | "members">
> & { memberIds?: string[] };

// ── Store shape ───────────────────────────────────────────────────────────────

export interface ProjectStore {
  projects: Project[];
  addProject:    (input: NewProjectInput) => Project;
  updateProject: (id: string, changes: UpdateProjectInput) => boolean;
  deleteProject: (id: string) => boolean;
  addMember:     (projectId: string, userId: string) => void;
  removeMember:  (projectId: string, userId: string) => void;
  resetToMock:   () => void;
}

// ── ID counter ────────────────────────────────────────────────────────────────
let _pCounter = MOCK_PROJECTS.length + 1;
const nextProjectId = () => `p${_pCounter++}`;

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

// ── Store (no persist/devtools — avoids SSR hydration mismatch) ───────────────
export const useProjectStore = create<ProjectStore>()(
  (set, get) => ({
    projects: MOCK_PROJECTS,

    addProject(input) {
      const members: User[] = (input.memberIds ?? ["u1"])
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
      return project;
    },

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
      return found;
    },

    deleteProject(id) {
      const exists = get().projects.some((p) => p.id === id);
      if (!exists) return false;
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
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

    resetToMock() {
      set({ projects: MOCK_PROJECTS });
    },
  })
);

// ── Selector hooks ────────────────────────────────────────────────────────────

export const useProjects = () => useProjectStore((s) => s.projects);

export const useProject = (id: string) =>
  useProjectStore((s) => s.projects.find((p) => p.id === id));

/**
 * Returns action functions with stable references.
 * Each action is selected individually — Zustand store function refs
 * are stable (created once), so no new object is returned from the snapshot.
 */
export function useProjectActions() {
  const addProject    = useProjectStore((s) => s.addProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const addMember     = useProjectStore((s) => s.addMember);
  const removeMember  = useProjectStore((s) => s.removeMember);
  const resetToMock   = useProjectStore((s) => s.resetToMock);
  return { addProject, updateProject, deleteProject, addMember, removeMember, resetToMock };
}
