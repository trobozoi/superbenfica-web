import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, clearAuthCookies, REFRESH_COOKIE } from "@/lib/server/auth-cookies";
import { forbiddenOrigin, isTrustedRequest } from "@/lib/server/csrf";
import { revokeRefreshToken } from "@/lib/server/django";

/** Logout: invalida o refresh token na API (blacklist) e apaga os cookies. */
export async function POST(request: NextRequest) {
  if (!isTrustedRequest(request)) return forbiddenOrigin();

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (refresh) {
    await revokeRefreshToken(refresh, request.cookies.get(ACCESS_COOKIE)?.value);
  }

  const response = new NextResponse(null, { status: 204 });
  clearAuthCookies(response.cookies);
  return response;
}
