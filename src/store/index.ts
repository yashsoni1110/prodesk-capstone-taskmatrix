/**
 * @file src/store/index.ts
 * Central re-export for all Zustand stores.
 * Import from here instead of individual store files.
 *
 * Example:
 *   import { useTasks, useTaskActions, useProjects } from "@/store";
 */

// ── Auth Store ────────────────────────────────────────────────────────────────
export {
  useAuthStore,
  useCurrentUser,
  useIsAuthenticated,
  useAuthActions,
} from "./auth-store";

export type { AuthStore } from "./auth-store";

// ── Task Store ────────────────────────────────────────────────────────────────
export {
  useTaskStore,
  useTasks,
  useTasksByStatus,
  useTask,
  useTaskActions,
} from "./task-store";

export type {
  NewTaskInput,
  UpdateTaskInput,
  TaskStore,
} from "./task-store";

// ── Project Store ─────────────────────────────────────────────────────────────
export {
  useProjectStore,
  useProjects,
  useProject,
  useProjectActions,
  PROJECT_COLORS,
} from "./project-store";

export type {
  NewProjectInput,
  UpdateProjectInput,
  ProjectStore,
} from "./project-store";

// ── Team Store ────────────────────────────────────────────────────────────────
export {
  useTeamStore,
  useTeamMembers,
  useActiveMembers,
  useTeamMember,
  useTeamActions,
} from "./team-store";

export type { TeamMember, TeamStore } from "./team-store";

// ── Notification Store ────────────────────────────────────────────────────────
export {
  useNotificationStore,
  useNotifications,
  useUnreadCount,
} from "./notification-store";

export type { Notification } from "./notification-store";
