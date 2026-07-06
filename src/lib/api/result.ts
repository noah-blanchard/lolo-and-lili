import { z } from "zod";

/** Machine-readable error codes shared across routes, actions & client. */
export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** HTTP status mapping — centralised so routes never hard-code numbers. */
export const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION: 422,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

export interface ApiErrorShape {
  code: ErrorCode;
  message: string;
  /** e.g. flattened zod field errors for forms. */
  details?: unknown;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorShape };

export function ok<T>(data: T): ApiResult<T> {
  return { ok: true, data };
}

export function err(
  code: ErrorCode,
  message: string,
  details?: unknown,
): ApiResult<never> {
  return { ok: false, error: { code, message, details } };
}

/** Single client-side guard to narrow a result. */
export function isOk<T>(
  result: ApiResult<T>,
): result is { ok: true; data: T } {
  return result.ok;
}

/**
 * Throwable error carrying an ErrorCode. `defineRoute`/`defineAction` catch
 * these and convert them into the standard envelope + HTTP status.
 */
export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Convenience throwers for common cases. */
export const fail = {
  unauthorized: (msg = "Not authenticated") =>
    new ApiError(ErrorCode.UNAUTHORIZED, msg),
  forbidden: (msg = "Not allowed") => new ApiError(ErrorCode.FORBIDDEN, msg),
  notFound: (msg = "Not found") => new ApiError(ErrorCode.NOT_FOUND, msg),
  conflict: (msg = "Conflict") => new ApiError(ErrorCode.CONFLICT, msg),
};

/** Turn a ZodError into a VALIDATION ApiError with flattened field details. */
export function validationError(error: z.ZodError): ApiError {
  return new ApiError(
    ErrorCode.VALIDATION,
    "Validation failed",
    z.flattenError(error).fieldErrors,
  );
}
