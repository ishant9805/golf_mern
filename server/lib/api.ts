import { NextResponse } from "next/server";
import type { ApiError, ApiSuccess } from "@/types";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

export function fail(error: string, status = 400) {
  return NextResponse.json<ApiError>({ success: false, error }, { status });
}

export function handleServerError(error: unknown) {
  console.error(error);
  return fail("Something went wrong. Please try again.", 500);
}
