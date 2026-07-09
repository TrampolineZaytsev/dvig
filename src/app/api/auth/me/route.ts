import { jsonOk, handleApiError } from "@/lib/api";
import { getSessionUser, getUserWithProfile, toPublicUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return jsonOk({ user: null });
    }
    const user = await getUserWithProfile(session.id);
    if (!user) {
      return jsonOk({ user: null });
    }
    return jsonOk({ user: toPublicUser(user) });
  } catch (error) {
    return handleApiError(error);
  }
}
