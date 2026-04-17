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

  /**
   * The last error message from Supabase (login / register failures).
   * null when there is no error.
   */
  lastError: string | null;

  /**
   * True after signUp when Supabase requires email confirmation before
   * the session is created. The user was created but cannot log in yet.
   */
  pendingEmailConfirmation: boolean;

  // ── Actions ──────────────────────────────────────────────────────────────────

  /**
   * Sign in with email + password via Supabase.
   * Falls back to mock-user match so existing demo UI keeps working.
   * Returns true on success, false on failure.
   */
  login: (email: string, password: string) => Promise<boolean>;

  /**
   * Register a new user via Supabase signUp.
   * Returns true on success (or pending confirmation), false on hard failure.
   * Check pendingEmailConfirmation to distinguish the two success cases.
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

  /** Clear the last error message. */
  clearError: () => void;
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

/**
 * Build a full User object from a Supabase-authenticated user.
 * Priority:
 *   1. Exact email match in MOCK_USERS (preserves demo profiles: name, role, avatar)
 *   2. Derive name from email — e.g. "john.doe@gmail.com" → "John Doe"
 *      initials computed from the derived name.
 *
 * This ensures EVERY real registered user gets a proper display name and
 * initials instead of showing "Guest" or "Account".
 */
function buildUserFromSupabase(
  supaUser: { id: string; email?: string | null }
): User {
  const email = supaUser.email ?? "";
  const mockMatch = findMockUser(email);
  if (mockMatch) return mockMatch;

  // Derive a human-readable name from the email local-part
  // e.g. "john.doe" → "John Doe", "y4417546" → "Y4417546"
  const localPart = email.split("@")[0] ?? "user";
  const nameParts = localPart
    .replace(/[._+\-]/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
  const name = nameParts.join(" ") || email;
  const initials = nameParts
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    id: supaUser.id,
    name,
    email,
    avatar: "",
    initials,
    role: "developer", // default role for self-registered users
  };
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
  lastError: null,
  pendingEmailConfirmation: false,

  // ── initializeAuth ──────────────────────────────────────────────────────────
  initializeAuth() {
    // 1. Immediately read the cached session (localStorage, no network round-trip)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({
          supabaseUser: toSupabaseUser(session.user),
      user: buildUserFromSupabase(session.user),
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
        user: buildUserFromSupabase(session.user),
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
        user: buildUserFromSupabase(session.user),
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
    set({ isLoading: true, lastError: null });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data.user) {
      set({
        supabaseUser: toSupabaseUser(data.user),
        user: buildUserFromSupabase(data.user),
        isAuthenticated: true,
        initialized: true,
        isLoading: false,
        lastError: null,
      });
      return true;
    }

    // Fallback: demo-only mock match (offline / Supabase unreachable)
    const mockUser = findMockUser(email);
    if (mockUser) {
      set({ user: mockUser, isAuthenticated: true, initialized: true, isLoading: false, lastError: null });
      return true;
    }

    // Surface the real Supabase error so the UI can show something meaningful
    const msg = error?.message ?? "Login failed. Please check your credentials.";
    set({ isLoading: false, lastError: msg });
    return false;
  },

  // ── register ─────────────────────────────────────────────────────────────────
  async register(email, password) {
    set({ isLoading: true, lastError: null, pendingEmailConfirmation: false });

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      set({ isLoading: false, lastError: error.message });
      return false;
    }

    if (!data.user) {
      set({ isLoading: false, lastError: "Registration failed. Please try again." });
      return false;
    }

    // Supabase returns a user but NO session when email confirmation is required.
    // In that case we set pendingEmailConfirmation=true instead of marking
    // the user as authenticated.
    if (!data.session) {
      set({
        isLoading: false,
        initialized: true,
        pendingEmailConfirmation: true,
        lastError: null,
      });
      return true; // true = no hard error; check pendingEmailConfirmation in UI
    }

    // Session available immediately (email confirmation disabled in Supabase)
    set({
      supabaseUser: toSupabaseUser(data.user),
      user: buildUserFromSupabase(data.user),
      isAuthenticated: true,
      initialized: true,
      isLoading: false,
      pendingEmailConfirmation: false,
      lastError: null,
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

  // ── clearError ────────────────────────────────────────────────────────────
  clearError() {
    set({ lastError: null });
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

/** Returns the last Supabase error message (or null). */
export const useAuthError = () => useAuthStore((s) => s.lastError);

/** Returns true when registration succeeded but email confirmation is needed. */
export const usePendingEmailConfirmation = () =>
  useAuthStore((s) => s.pendingEmailConfirmation);

/** Returns action functions with stable references. */
export function useAuthActions() {
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const getCurrentUser = useAuthStore((s) => s.getCurrentUser);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const clearError = useAuthStore((s) => s.clearError);
  return { login, logout, register, getCurrentUser, initializeAuth, updateProfile, clearError };
}
