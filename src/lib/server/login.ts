import "server-only";
import { NextResponse } from "next/server";
import { isCustomer, sessionFromAccessToken } from "@/lib/utils/jwt";
import { setAuthCookies, type TokenPair } from "./auth-cookies";
import { obtainTokens, revokeRefreshToken, upstreamError } from "./django";

/**
 * Troca e-mail/senha por tokens na API e devolve a resposta com os cookies de sessão.
 * Compartilhado pelas rotas de login e de cadastro (que faz login logo após criar a conta).
 */
export async function loginResponse(email: string, password: string): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await obtainTokens(email, password);
  } catch {
    return NextResponse.json({ detail: "API indisponível." }, { status: 503 });
  }

  if (!upstream.ok) {
    const { status, body } = await upstreamError(upstream, "Falha no login.");
    return NextResponse.json(body, { status });
  }

  const tokens = (await upstream.json()) as TokenPair;
  const user = sessionFromAccessToken(tokens.access);

  // Funcionários têm conta na API, mas compram/gerenciam pelo painel administrativo.
  if (!user || !isCustomer(user)) {
    if (tokens.refresh) await revokeRefreshToken(tokens.refresh, tokens.access);
    return NextResponse.json(
      {
        detail: "A loja online é exclusiva para clientes. Use o painel administrativo.",
        code: "role_not_allowed",
      },
      { status: 403 },
    );
  }

  const response = NextResponse.json({ user });
  setAuthCookies(response.cookies, tokens);
  return response;
}
