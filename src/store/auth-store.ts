import { create } from "zustand";
import { MOCK_USERS } from "@/lib/data";
import type { User } from "@/lib/data";

// ── Store shape ───────────────────────────────────────────────────────────────

export interface AuthStore {
  /** Currently authenticated user (null when logged out) */
  user: User | null;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** True while a login request is in-flight */
  isLoading: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Simulate login by matching email against mock users.
   * Returns true on success, false on failure.
   */
  login: (email: string, password: string) => Promise<boolean>;

  /** Clear auth state (logout). */
  logout: () => void;

  /** Partially update the current user's profile fields. */
  updateProfile: (changes: Partial<Pick<User, "name" | "email" | "avatar">>) => void;
}

// ── Store (no persist — avoids SSR hydration mismatch) ────────────────────────

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  async login(email, _password) {
    set({ isLoading: true });

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
      set({ user, isAuthenticated: true, isLoading: false });
      return true;
    }

    set({ isLoading: false });
    return false;
  },

  logout() {
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  updateProfile(changes) {
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, ...changes } };
    });
  },
}));

// ── Selector hooks ────────────────────────────────────────────────────────────

/** Returns the current user (or null). */
export const useCurrentUser = () => useAuthStore((s) => s.user);

/** Returns whether the user is authenticated. */
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

/** Returns action functions with stable references. */
export function useAuthActions() {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  return { login, logout, updateProfile };
}
