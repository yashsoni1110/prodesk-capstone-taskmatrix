import { create } from "zustand";
import { MOCK_USERS } from "@/lib/data";
import type { User, Role } from "@/lib/data";

// ── Extended member type ──────────────────────────────────────────────────────

export interface TeamMember extends User {
  joinedAt: string;
  status: "active" | "invited" | "deactivated";
}

// ── Store shape ───────────────────────────────────────────────────────────────

export interface TeamStore {
  members: TeamMember[];

  /**
   * Invite a new member by email.
   * Creates a temporary member with "invited" status.
   */
  inviteMember: (email: string, name: string, role: Role) => TeamMember;

  /** Remove a member by id. Returns true if found and removed. */
  removeMember: (id: string) => boolean;

  /** Update a member's role. */
  updateRole: (id: string, role: Role) => void;

  /** Update a member's status (active/deactivated). */
  updateStatus: (id: string, status: TeamMember["status"]) => void;

  /** Reset to initial mock data. */
  resetToMock: () => void;
}

// ── Build initial members from MOCK_USERS ─────────────────────────────────────

function buildInitialMembers(): TeamMember[] {
  return MOCK_USERS.map((u) => ({
    ...u,
    joinedAt: "2025-01-15",
    status: "active" as const,
  }));
}

// ── ID counter ────────────────────────────────────────────────────────────────

let _tmId = MOCK_USERS.length + 1;
const nextMemberId = () => `u${_tmId++}`;

// ── Store (no persist — avoids SSR hydration mismatch) ────────────────────────

export const useTeamStore = create<TeamStore>()((set, get) => ({
  members: buildInitialMembers(),

  inviteMember(email, name, role) {
    // Generate initials from name
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newMember: TeamMember = {
      id: nextMemberId(),
      name,
      email,
      avatar: "",
      initials,
      role,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "invited",
    };

    set((state) => ({ members: [...state.members, newMember] }));
    return newMember;
  },

  removeMember(id) {
    const exists = get().members.some((m) => m.id === id);
    if (!exists) return false;
    set((state) => ({
      members: state.members.filter((m) => m.id !== id),
    }));
    return true;
  },

  updateRole(id, role) {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, role } : m
      ),
    }));
  },

  updateStatus(id, status) {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === id ? { ...m, status } : m
      ),
    }));
  },

  resetToMock() {
    set({ members: buildInitialMembers() });
  },
}));

// ── Selector hooks ────────────────────────────────────────────────────────────

/** Returns all team members. */
export const useTeamMembers = () => useTeamStore((s) => s.members);

/** Returns only active members. */
export const useActiveMembers = () =>
  useTeamStore((s) => s.members.filter((m) => m.status === "active"));

/** Returns a single member by id (or undefined). */
export const useTeamMember = (id: string) =>
  useTeamStore((s) => s.members.find((m) => m.id === id));

/** Returns action functions with stable references. */
export function useTeamActions() {
  const inviteMember = useTeamStore((s) => s.inviteMember);
  const removeMember = useTeamStore((s) => s.removeMember);
  const updateRole = useTeamStore((s) => s.updateRole);
  const updateStatus = useTeamStore((s) => s.updateStatus);
  const resetToMock = useTeamStore((s) => s.resetToMock);
  return { inviteMember, removeMember, updateRole, updateStatus, resetToMock };
}
