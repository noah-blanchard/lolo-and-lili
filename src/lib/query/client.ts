import { ApiError, ErrorCode, type ApiResult } from "@/lib/api/result";

/**
 * Typed fetch for our `/api/*` route handlers. Every route returns an
 * `ApiResult<T>`; this unwraps it — returning `data` on success and throwing an
 * `ApiError` on failure so TanStack Query surfaces it via `error`.
 */
export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let body: ApiResult<T>;
  try {
    body = (await res.json()) as ApiResult<T>;
  } catch {
    throw new ApiError(
      ErrorCode.INTERNAL,
      `Invalid response from ${input} (${res.status})`,
    );
  }

  if (!body.ok) {
    throw new ApiError(body.error.code, body.error.message, body.error.details);
  }

  return body.data;
}

/** Helper for JSON mutation bodies. */
export function jsonBody(data: unknown): RequestInit {
  return { method: "POST", body: JSON.stringify(data) };
}
