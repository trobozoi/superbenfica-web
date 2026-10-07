import { type NextRequest, NextResponse } from "next/server";
import { isProduction, publicEnv } from "@/lib/env";
import {
  ACCESS_COOKIE,
  clearAuthCookies,
  REFRESH_COOKIE,
  setAuthCookies,
  type TokenPair,
} from "@/lib/server/auth-cookies";
import { refreshTokens } from "@/lib/server/django";
import { VIACEP_ORIGIN } from "@/lib/services/cep.service";
import { PROTECTED_PREFIXES, ROUTES } from "@/lib/utils/constants";
import { isCustomer, isExpired, sessionFromAccessToken } from "@/lib/utils/jwt";
import type { SessionUser } from "@/types/api";

/**
 * Proxy do Next 16 (antigo middleware). Roda antes de cada página e:
 * 1. aplica a Content-Security-Policy com nonce por requisição (mitiga XSS);
 * 2. renova o access token expirado usando o refresh token;
 * 3. redireciona para /entrar quem acessa página protegida sem sessão;
 * 4. tira da tela de login quem já está logado.
 */

const AUTH_PAGES = new Set<string>([ROUTES.login, ROUTES.register]);

function buildCsp(nonce: string): string {
  const wsOrigin = new URL(publicEnv.NEXT_PUBLIC_WS_URL).origin;
  // O React em desenvolvimento usa eval para mensagens de erro; em produção, não.
  const devEval = isProduction ? "" : " 'unsafe-eval'";
  // Só em desenvolvimento: extensões do editor (ex.: Console Ninja) abrem WebSocket local
  // em porta aleatória; bloqueadas, enchem o terminal do `next dev` de erros.
  const devWs = isProduction ? "" : " ws:";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval}`,
    // Estilos inline (atributo style) de bibliotecas como o sonner não aceitam nonce.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    // ViaCEP: preenchimento do endereço a partir do CEP (cep.service.ts).
    `connect-src 'self' ${wsOrigin} ${VIACEP_ORIGIN}${devWs}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

interface ResolvedSession {
  user: SessionUser | null;
  refreshed: TokenPair | null;
  /** Havia cookies de sessão que precisam ser apagados (refresh inválido). */
  stale: boolean;
}

async function resolveSession(request: NextRequest): Promise<ResolvedSession> {
  const current = sessionFromAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  if (current && !isExpired(current.exp)) return { user: current, refreshed: null, stale: false };

  const refresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) return { user: null, refreshed: null, stale: Boolean(current) };

  const tokens = await refreshTokens(refresh);
  const user = sessionFromAccessToken(tokens?.access);
  return user && tokens
    ? { user, refreshed: tokens, stale: false }
    : { user: null, refreshed: null, stale: true };
}

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function redirectTo(request: NextRequest, pathname: string, withNext = false): NextResponse {
  const url = new URL(pathname, request.url);
  if (withNext) {
    url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  }
  return NextResponse.redirect(url);
}

function decide(request: NextRequest, user: SessionUser | null): NextResponse | null {
  const { pathname } = request.nextUrl;
  const loggedIn = isCustomer(user);
  if (!loggedIn && isProtected(pathname)) return redirectTo(request, ROUTES.login, true);
  if (loggedIn && AUTH_PAGES.has(pathname)) return redirectTo(request, ROUTES.produtos);
  return null;
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);
  const session = await resolveSession(request);

  // Tokens renovados também vão para a requisição atual, para os Server Components.
  if (session.refreshed) {
    request.cookies.set(ACCESS_COOKIE, session.refreshed.access);
    if (session.refreshed.refresh) request.cookies.set(REFRESH_COOKIE, session.refreshed.refresh);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response =
    decide(request, session.user) ?? NextResponse.next({ request: { headers: requestHeaders } });

  response.headers.set("Content-Security-Policy", csp);
  if (session.refreshed) setAuthCookies(response.cookies, session.refreshed);
  else if (session.stale) clearAuthCookies(response.cookies);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico|webp)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
