import { type NextRequest, NextResponse } from "next/server";
import { forbiddenOrigin, isTrustedRequest } from "@/lib/server/csrf";
import { loginResponse } from "@/lib/server/login";
import { loginSchema } from "@/lib/utils/validation";

/** Login: troca e-mail/senha por tokens na API e os grava em cookies httpOnly. */
export async function POST(request: NextRequest) {
  if (!isTrustedRequest(request)) return forbiddenOrigin();

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ detail: "Informe e-mail e senha válidos." }, { status: 400 });
  }
  return loginResponse(parsed.data.email, parsed.data.password);
}
