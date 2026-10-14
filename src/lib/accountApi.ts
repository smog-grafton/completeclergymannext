"use client";

const tokenKey = "cc_access_token";

export class AccountApiError extends Error {
  constructor(message: string, public readonly status?: number, public readonly fields?: Record<string, string[]>) {
    super(message);
    this.name = "AccountApiError";
  }
}

export function apiOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!origin) throw new Error("Account services are not configured yet.");
  return origin;
}

export function accessToken(): string | null {
  return typeof window === "undefined" ? null : window.localStorage.getItem(tokenKey);
}

export function saveAccessToken(token: string): void {
  window.localStorage.setItem(tokenKey, token);
}

export function clearAccessToken(): void {
  window.localStorage.removeItem(tokenKey);
}

export async function accountFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = accessToken();
  let response: Response;
  try {
    response = await fetch(`${apiOrigin()}/api/v1${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch {
    throw new AccountApiError("We couldn't connect to the server. Please try again.");
  }

  if (response.status === 401) clearAccessToken();
  return response;
}

export async function accountJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await accountFetch(path, init);
  const body = await response.json().catch(() => null) as { message?: string; errors?: Record<string, string[]> } | T | null;
  if (!response.ok) {
    const problem = body as { message?: string; errors?: Record<string, string[]> } | null;
    throw new AccountApiError(
      problem?.errors ? Object.values(problem.errors)[0]?.[0] ?? "The request could not be completed." : problem?.message ?? "The request could not be completed.",
      response.status,
      problem?.errors,
    );
  }
  return body as T;
}
