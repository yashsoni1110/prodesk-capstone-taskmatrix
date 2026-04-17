import { create } from "zustand";
import type { User } from "@/lib/data";

// ── Store shape ────────────────────────────────────────────────────────────────

export interface TeamStore {
  /** Extra members invited by the logged-in user (not from MOCK_USERS) */
  invitedMembers: User[];
  inviteMember: (member: Omit<User, "id" | "avatar" | "initials" | "role">) => User;
  removeMember: (id: string) => void;
  clearInvited: () => void;
}

let _counter = 1;
const nextId = () => `invited-${_counter++}`;

export const useTeamStore = create<TeamStore>()((set) => ({
  invitedMembers: [],

  inviteMember({ name, email }) {
    const nameParts = name.trim().split(" ");
    const initials  = nameParts.map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const member: User = {
      id:       nextId(),
      name:     name.trim(),
      email:    email.trim(),
      avatar:   "",
      initials,
      role:     "developer",
    };
    set((s) => ({ invitedMembers: [...s.invitedMembers, member] }));
    return member;
  },

  removeMember(id) {
    set((s) => ({ invitedMembers: s.invitedMembers.filter((m) => m.id !== id) }));
  },

  clearInvited() {
    set({ invitedMembers: [] });
  },
}));

export const useInvitedMembers = () => useTeamStore((s) => s.invitedMembers);
