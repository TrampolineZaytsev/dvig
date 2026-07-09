import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      return jsonError("Требуется вход", 401);
    }
    if (error.message === "FORBIDDEN") {
      return jsonError("Недостаточно прав", 403);
    }
  }
  console.error(error);
  return jsonError("Внутренняя ошибка сервера", 500);
}
