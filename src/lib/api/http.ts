export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Lowest-level fetch wrapper: JSON in/out, cookies included (the refresh token
 * lives in an httpOnly cookie), no auth-header or retry logic. Used directly by
 * the auth store's own login/register/refresh/logout calls, which can't go
 * through `apiFetch` in client.ts without a circular dependency.
 */
export async function rawFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await safeJson(res);
    throw new ApiError(res.status, errorMessage(body, res.status), body);
  }

  if (res.status === 204) return undefined as T;
  return (await safeJson(res)) as T;
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function errorMessage(body: unknown, status: number): string {
  if (body && typeof body === "object" && "message" in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }
  return `Request failed with status ${status}`;
}
