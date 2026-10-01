"use client";

const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export async function postPublicApi<T>(path: string, payload: unknown): Promise<T> {
  if (!apiBase) throw new Error("NEXT_PUBLIC_API_URL is required to submit this form.");

  const response = await fetch(apiBase + "/api/v1" + path, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; errors?: Record<string, string[]> } | null;
    const firstError = body?.errors ? Object.values(body.errors)[0]?.[0] : undefined;
    throw new Error(firstError ?? body?.message ?? "The server could not accept this submission.");
  }

  return response.json() as Promise<T>;
}
