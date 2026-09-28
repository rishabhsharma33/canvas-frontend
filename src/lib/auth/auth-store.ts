import { create } from "zustand";
import { ApiError, rawFetch } from "@/lib/api/http";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  error: string | null;

  /** Tries to restore a session from the refresh cookie on app load. */
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Called by the API client when a request 401s and refresh also fails. */
  forceLogout: () => void;
}

interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: "idle",
  user: null,
  accessToken: null,
  error: null,

  bootstrap: async () => {
    if (get().status !== "idle") return;
    set({ status: "loading" });
    try {
      const { accessToken } = await rawFetch<{ accessToken: string }>(
        "/auth/refresh",
        { method: "POST" }
      );
      const user = await rawFetch<AuthUser>("/auth/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      set({ status: "authenticated", accessToken, user, error: null });
    } catch {
      set({ status: "unauthenticated", accessToken: null, user: null });
    }
  },

  login: async (email, password) => {
    set({ error: null });
    try {
      const res = await rawFetch<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      set({ status: "authenticated", accessToken: res.accessToken, user: res.user });
    } catch (err) {
      set({ error: authErrorMessage(err) });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ error: null });
    try {
      const res = await rawFetch<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      set({ status: "authenticated", accessToken: res.accessToken, user: res.user });
    } catch (err) {
      set({ error: authErrorMessage(err) });
      throw err;
    }
  },

  logout: async () => {
    try {
      await rawFetch("/auth/logout", { method: "POST" });
    } catch {
      // Best-effort — clear local session regardless.
    }
    set({ status: "unauthenticated", accessToken: null, user: null });
  },

  forceLogout: () => {
    set({ status: "unauthenticated", accessToken: null, user: null });
  },
}));

function authErrorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  return "Something went wrong. Please try again.";
}
