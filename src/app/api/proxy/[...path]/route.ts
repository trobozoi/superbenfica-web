import { type NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE } from "@/lib/server/auth-cookies";
import { forbiddenOrigin, isTrustedRequest } from "@/lib/server/csrf";
import { djangoFetch } from "@/lib/server/django";
import { PROXY_ALLOWED_RESOURCES } from "@/lib/utils/constants";

/**
 * Proxy autenticado do navegador para a API Django (padrão BFF).
 * O navegador chama /api/proxy/<recurso>; aqui o token do cookie httpOnly vira o
 * cabeçalho Authorization. Se o access expirou, a API responde 401 e o cliente HTTP
 * renova a sessão (lib/api/client.ts) e repete a requisição.
 */

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

// Só segmentos simples: impede path traversal ("..") e URLs arbitrárias.
const SEGMENT = /^[\w-]+$/;
// A loja só envia JSON pequeno (pedidos, endereços).
const MAX_BODY_BYTES = 256 * 1024;
const FORWARDED_RESPONSE_HEADERS = ["content-type", "retry-after"];

function isAllowedPath(path: string[]): boolean {
  const [resource] = path;
  return (
    resource !== undefined &&
    PROXY_ALLOWED_RESOURCES.has(resource) &&
    path.every((segment) => SEGMENT.test(segment))
  );
}

async function forward(request: NextRequest, { params }: RouteContext) {
  if (!isTrustedRequest(request)) return forbiddenOrigin();

  const { path } = await params;
  if (!isAllowedPath(path)) {
    return NextResponse.json({ detail: "Recurso não encontrado." }, { status: 404 });
  }

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (!accessToken) {
    return NextResponse.json({ detail: "Não autenticado." }, { status: 401 });
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : null;
  if (body && body.byteLength > MAX_BODY_BYTES) {
    return NextResponse.json({ detail: "Requisição grande demais." }, { status: 413 });
  }

  let upstream: Response;
  try {
    upstream = await djangoFetch(path.join("/"), {
      method: request.method,
      accessToken,
      search: request.nextUrl.search,
      body,
      contentType: hasBody ? request.headers.get("content-type") : null,
    });
  } catch {
    return NextResponse.json({ detail: "API indisponível." }, { status: 503 });
  }

  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }
  const responseBody = upstream.status === 204 ? null : await upstream.arrayBuffer();
  return new NextResponse(responseBody, { status: upstream.status, headers });
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
