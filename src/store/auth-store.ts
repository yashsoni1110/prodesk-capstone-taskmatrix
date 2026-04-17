import { create } from "zustand";
import { MOCK_USERS } from "@/lib/data";
import type { User } from "@/lib/data";
import { supabase } from "@/lib/supabase";

// ── Supabase auth user shape (id + email only) ────────────────────────────────

export interface SupabaseUser {
  id: string;
  email: string;
}

// ── Store shape ───────────────────────────────────────────────────────────────

export interface AuthStore {
  /** Currently authenticated app-level user (null when logged out) */
  user: User | null;

  /** Whether the user is authenticated */
  isAuthenticated: boolean;

  /** True while a login/register/session check is in-flight */
  isLoading: boolean;

  /**
   * True once the initial auth check has completed (success or failure).
   * Use this to gate redirects — avoids false-negative redirect before
   * Supabase has had a chance to restore the session from localStorage.
   */
  initialized: boolean;

  /**
   * Supabase-authenticated user (id + email).
   * Populated by login(), register(), and initializeAuth().
   */
  supabaseUser: SupabaseUser | null;

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Sign in with email + password via Supabase.
   * Falls back to mock-user match so existing demo UI keeps working.
   * Returns true on success, false on failure.
   */
  login: (email: string, password: string) => Promise<boolean>;

  /**
   * Register a new user via Supabase signUp.
   * Returns true on success, false on failure.
   */
  register: (email: string, password: string) => Promise<boolean>;

  /** Sign out via Supabase and clear all auth state. */
  logout: () => Promise<void>;

  /**
   * One-shot session restore using the locally cached token (no network).
   * Kept for direct use; prefer initializeAuth() for app-level setup.
   */
  getCurrentUser: () => Promise<void>;

  /**
   * Call once on app mount (inside a useEffect).
   * 1. Reads the session from Supabase's localStorage cache instantly.
   * 2. Subscribes to onAuthStateChange for automatic sync on token
   *    refresh, sign-in from another tab, and sign-out events.
   * Returns an unsubscribe function — call it in the useEffect cleanup.
   *
   * Safe for Next.js: runs only client-side, no localStorage access
   * during SSR, no Zustand persist middleware.
   */
  initializeAuth: () => () => void;

  /** Partially update the current user's profile fields. */
  updateProfile: (changes: Partial<Pick<User, "name" | "email" | "avatar">>) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Map a Supabase user to the SupabaseUser shape stored in the store. */
function toSupabaseUser(u: { id: string; email?: string | null }): SupabaseUser {
  return { id: u.id, email: u.email ?? "" };
}

/**
 * Try to find a matching mock user by email.
 * This preserves the existing demo flow (name, avatar, role, etc.).
 */
function findMockUser(email: string): User | undefined {
  return MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ── Store ─────────────────────────────────────────────────────────────────────
// No persist middleware — Supabase manages its own session in localStorage.
// Zustand state always starts clean on both server and client, which
// prevents SSR ↔ client hydration mismatches.

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  initialized: false,
  supabaseUser: null,

  // ── initializeAuth ──────────────────────────────────────────────────────────
  initializeAuth() {
    // 1. Immediately read the cached session (localStorage, no network round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({
          supabaseUser: toSupabaseUser(session.user),
          user: findMockUser(session.user.email ?? "") ?? null,
          isAuthenticated: true,
          initialized: true,
          isLoading: false,
        });
      } else {
        set({ initialized: true, isLoading: false });
      }
    });

    // 2. Subscribe to future auth events (token refresh, multi-tab sign-out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          set({
            supabaseUser: toSupabaseUser(session.user),
            user: findMockUser(session.user.email ?? "") ?? null,
            isAuthenticated: true,
            initialized: true,
            isLoading: false,
          });
        } else {
          set({
            supabaseUser: null,
            user: null,
            isAuthenticated: false,
            initialized: true,
            isLoading: false,
          });
        }
      }
    );

    // Return unsubscribe so the caller can clean up in useEffect
    return () => subscription.unsubscribe();
  },

  // ── getCurrentUser ──────────────────────────────────────────────────────────
  async getCurrentUser() {
    set({ isLoading: true });

    const { data: { session }, error } = await supabase.auth.getSession();

    if (!error && session?.user) {
      set({
        supabaseUser: toSupabaseUser(session.user),
        user: findMockUser(session.user.email ?? "") ?? null,
        isAuthenticated: true,
        initialized: true,
        isLoading: false,
      });
    } else {
      set({ initialized: true, isLoading: false });
    }
  },

  // ── login ───────────────────────────────────────────────────────────────────
  async login(email, password) {
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      const mockUser = findMockUser(email);
      set({
        supabaseUser: toSupabaseUser(data.user),
        user: mockUser ?? null,
        isAuthenticated: true,
        initialized: true,
        isLoading: false,
      });
      return true;
    }

    // Fallback: demo-only mock match (no real Supabase user required)
    const mockUser = findMockUser(email);
    if (mockUser) {
      set({ user: mockUser, isAuthenticated: true, initialized: true, isLoading: false });
      return true;
    }

    set({ isLoading: false });
    return false;
  },

  // ── register ─────────────────────────────────────────────────────────────────
  async register(email, password) {
    set({ isLoading: true });

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      set({ isLoading: false });
      return false;
    }

    set({
      supabaseUser: toSupabaseUser(data.user),
      user: findMockUser(email) ?? null,
      isAuthenticated: true,
      initialized: true,
      isLoading: false,
    });
    return true;
  },

  // ── logout ───────────────────────────────────────────────────────────────────
  async logout() {
    await supabase.auth.signOut();
    set({
      user: null,
      supabaseUser: null,
      isAuthenticated: false,
      initialized: true,
      isLoading: false,
    });
  },

  // ── updateProfile (unchanged) ─────────────────────────────────────────────
  updateProfile(changes) {
    set((state) => {
      if (!state.user) return state;
      return { user: { ...state.user, ...changes } };
    });
  },
}));

// ── Selector hooks ────────────────────────────────────────────────────────────

/** Returns the current app-level user (or null). */
export const useCurrentUser = () => useAuthStore((s) => s.user);

/** Returns whether the user is authenticated. */
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);

/** Returns true once the initial auth check has completed. */
export const useAuthInitialized = () => useAuthStore((s) => s.initialized);

/** Returns the Supabase-authenticated user (id + email), or null. */
export const useSupabaseUser = () => useAuthStore((s) => s.supabaseUser);

/** Returns action functions with stable references. */
export function useAuthActions() {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  return { login, logout, register, getCurrentUser, initializeAuth, updateProfile };
}
