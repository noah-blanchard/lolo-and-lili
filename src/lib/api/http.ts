import { NextResponse } from "next/server";
import {
  ApiError,
  ErrorCode,
  HTTP_STATUS,
  type ApiErrorShape,
} from "./result";

/** Serialize a success envelope with a 200 (or custom) status. */
export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true as const, data }, { status });
}

/** Serialize an error envelope with the status mapped from its code. */
export function jsonError(error: ApiErrorShape) {
  return NextResponse.json(
    { ok: false as const, error },
    { status: HTTP_STATUS[error.code] },
  );
}

/**
 * Convert any thrown value into a safe error envelope. Known `ApiError`s pass
 * through their code/message/details; anything else becomes INTERNAL with no
 * leaked stack trace.
 */
export function toErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return jsonError({
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  console.error("[api] unhandled error:", error);
  return jsonError({
    code: ErrorCode.INTERNAL,
    message: "Something went wrong",
  });
}
