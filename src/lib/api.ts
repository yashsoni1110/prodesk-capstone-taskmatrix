/**
 * @file src/lib/api.ts
 *
 * Mock API service layer.
 * Each function simulates a REST endpoint by:
 *   1. Awaiting a short delay (simulates network latency)
 *   2. Reading/writing Zustand store state
 *
 * This pattern keeps UI code identical to a real API integration —
 * swap the internals for `fetch()` calls when you add a real backend.
 */

import { useTaskStore } from "@/store/task-store";
import { useProjectStore } from "@/store/project-store";
import { useAuthStore } from "@/store/auth-store";
import { useTeamStore } from "@/store/team-store";
import { MOCK_USERS } from "@/lib/data";
import type { Task, TaskStatus, User } from "@/lib/data";
import type { NewTaskInput, UpdateTaskInput } from "@/store/task-store";
import type { NewProjectInput, UpdateProjectInput } from "@/store/project-store";

// ── Network delay simulation ─────────────────────────────────────────────────

const DELAY_MS = 300;
const AUTH_DELAY_MS = 800;

function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Auth API ──────────────────────────────────────────────────────────────────

export const authApi = {
  /** POST /api/auth/login */
  async login(email: string, password: string): Promise<User | null> {
    await delay(AUTH_DELAY_MS);
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
    if (!user) return null;
    // In production: validate password, return JWT
    useAuthStore.getState().login(email, password);
    return user;
  },

  /** POST /api/auth/logout */
  async logout(): Promise<void> {
    await delay(200);
    useAuthStore.getState().logout();
  },

  /** GET /api/users/me */
  async getCurrentUser(): Promise<User | null> {
    await delay();
    return useAuthStore.getState().user;
  },
};

// ── Tasks API ─────────────────────────────────────────────────────────────────

export const tasksApi = {
  /** GET /api/tasks */
  async fetchAll(): Promise<Task[]> {
    await delay();
    return useTaskStore.getState().tasks;
  },

  /** GET /api/tasks/:id */
  async fetchById(id: string): Promise<Task | undefined> {
    await delay();
    return useTaskStore.getState().tasks.find((t) => t.id === id);
  },

  /** GET /api/tasks?status=X */
  async fetchByStatus(status: TaskStatus): Promise<Task[]> {
    await delay();
    return useTaskStore.getState().tasks.filter((t) => t.status === status);
  },

  /** POST /api/tasks */
  async create(input: NewTaskInput): Promise<Task> {
    await delay();
    return useTaskStore.getState().addTask(input);
  },

  /** PATCH /api/tasks/:id */
  async update(id: string, changes: UpdateTaskInput): Promise<boolean> {
    await delay();
    return useTaskStore.getState().updateTask(id, changes);
  },

  /** DELETE /api/tasks/:id */
  async remove(id: string): Promise<boolean> {
    await delay();
    return useTaskStore.getState().deleteTask(id);
  },

  /** PATCH /api/tasks/:id/move */
  async move(id: string, status: TaskStatus): Promise<void> {
    await delay();
    useTaskStore.getState().moveTask(id, status);
  },
};

// ── Projects API ──────────────────────────────────────────────────────────────

export const projectsApi = {
  /** GET /api/projects */
  async fetchAll() {
    await delay();
    return useProjectStore.getState().projects;
  },

  /** GET /api/projects/:id */
  async fetchById(id: string) {
    await delay();
    return useProjectStore.getState().projects.find((p) => p.id === id);
  },

  /** POST /api/projects */
  async create(input: NewProjectInput) {
    await delay();
    return useProjectStore.getState().addProject(input);
  },

  /** PATCH /api/projects/:id */
  async update(id: string, changes: UpdateProjectInput) {
    await delay();
    return useProjectStore.getState().updateProject(id, changes);
  },

  /** DELETE /api/projects/:id */
  async remove(id: string) {
    await delay();
    return useProjectStore.getState().deleteProject(id);
  },

  /** POST /api/projects/:id/members */
  async addMember(projectId: string, userId: string) {
    await delay();
    useProjectStore.getState().addMember(projectId, userId);
  },

  /** DELETE /api/projects/:id/members/:uid */
  async removeMember(projectId: string, userId: string) {
    await delay();
    useProjectStore.getState().removeMember(projectId, userId);
  },
};

// ── Users / Team API ──────────────────────────────────────────────────────────

export const usersApi = {
  /** GET /api/users — returns invited members from the team store */
  async fetchAll() {
    await delay();
    return useTeamStore.getState().invitedMembers;
  },

  /** GET /api/users/:id */
  async fetchById(id: string) {
    await delay();
    return useTeamStore.getState().invitedMembers.find((m) => m.id === id);
  },

  /** POST /api/users/invite */
  async invite(name: string, email: string) {
    await delay();
    return useTeamStore.getState().inviteMember({ name, email });
  },

  /** DELETE /api/users/:id */
  async remove(id: string) {
    await delay();
    return useTeamStore.getState().removeMember(id);
  },
};
