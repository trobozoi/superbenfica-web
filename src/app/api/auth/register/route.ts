import { type NextRequest, NextResponse } from "next/server";
import { forbiddenOrigin, isTrustedRequest } from "@/lib/server/csrf";
import { postJson, upstreamError } from "@/lib/server/django";
import { loginResponse } from "@/lib/server/login";
import { AUTH_ENDPOINTS } from "@/lib/utils/constants";
import { registerPayloadSchema } from "@/lib/utils/validation";

/**
 * Cadastro público de cliente (POST /api/auth/registrar/) seguido de login automático.
 * A API limita a 10 cadastros/hora por IP; o 429 é repassado ao formulário.
 */
export async function POST(request: NextRequest) {
  if (!isTrustedRequest(request)) return forbiddenOrigin();

  const parsed = registerPayloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Dados de cadastro inválidos." }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await postJson(AUTH_ENDPOINTS.registrar, parsed.data);
  } catch {
    return NextResponse.json({ detail: "API indisponível." }, { status: 503 });
  }

  if (!upstream.ok) {
    const { status, body } = await upstreamError(upstream, "Não foi possível criar a conta.");
    return NextResponse.json(body, { status });
  }

  return loginResponse(parsed.data.email, parsed.data.password);
}
