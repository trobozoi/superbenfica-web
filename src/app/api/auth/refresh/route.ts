import { type NextRequest, NextResponse } from "next/server";
import { clearAuthCookies, REFRESH_COOKIE, setAuthCookies } from "@/lib/server/auth-cookies";
import { forbiddenOrigin, isTrustedRequest } from "@/lib/server/csrf";
import { refreshTokens } from "@/lib/server/django";
import { sessionFromAccessToken } from "@/lib/utils/jwt";

/** Renova o access token usando o refresh token guardado no cookie httpOnly. */
export async function POST(request: NextRequest) {
  if (!isTrustedRequest(request)) return forbiddenOrigin();

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  const tokens = refresh ? await refreshTokens(refresh) : null;
  const user = sessionFromAccessToken(tokens?.access);

  if (!tokens || !user) {
    const response = NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
    clearAuthCookies(response.cookies);
    return response;
  }

  const response = NextResponse.json({ user });
  setAuthCookies(response.cookies, tokens);
  return response;
}
