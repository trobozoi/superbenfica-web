import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/server/auth-cookies";
import { isExpired, sessionFromAccessToken } from "@/lib/utils/jwt";

/**
 * Entrega o access token (vida curta) apenas para abrir o WebSocket, já que a API exige
 * ?token= na URL e o navegador não lê cookies httpOnly. É uma troca consciente: o token
 * só é exposto ao JavaScript da própria loja (mesma origem) e nunca é persistido.
 */
export function GET(request: NextRequest) {
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const user = sessionFromAccessToken(token);
  if (!token || !user || isExpired(user.exp)) {
    return NextResponse.json({ detail: "Sessão expirada." }, { status: 401 });
  }
  return NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } });
}
