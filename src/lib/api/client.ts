import { ApiError, rawFetch } from "./http";
import { useAuthStore } from "@/lib/auth/auth-store";

/**
 * Authenticated fetch wrapper used by every builder API call (documents/pages/
 * nodes/assets). On a 401 it tries exactly one silent refresh (the refresh
 * token lives in an httpOnly cookie) and retries once; if that also fails, it
 * forces the auth store back to "unauthenticated" so AuthGate shows the login
 * screen again.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  _retried = false
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  try {
    return await rawFetch<T>(path, {
      ...options,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && !_retried) {
      try {
        const { accessToken } = await rawFetch<{ accessToken: string }>(
          "/auth/refresh",
          { method: "POST" }
        );
        useAuthStore.setState({ accessToken, status: "authenticated" });
        return await apiFetch<T>(path, options, true);
      } catch {
        useAuthStore.getState().forceLogout();
      }
    }
    throw err;
  }
}
