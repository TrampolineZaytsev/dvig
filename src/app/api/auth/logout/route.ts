import { jsonOk, handleApiError } from "@/lib/server/api";
import { clearSessionCookie } from "@/lib/server/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
