import { jsonOk, handleApiError } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
