import { NextRequest } from "next/server";
import { verifySession } from "./session";

const COOKIE_NAME = "risedial_session";

/**
 * Reads the `risedial_session` cookie from a `NextRequest`, verifies the JWT,
 * and returns the payload. Returns `null` if the cookie is absent or the token
 * is invalid/expired.
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ user_id: string; subscription_status: string } | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
