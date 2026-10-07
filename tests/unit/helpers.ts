import type { Produto } from "@/types/entities";

/** Monta um JWT não assinado (o frontend só decodifica, não verifica). */
export function fakeJwt(claims: Record<string, unknown>): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}.assinatura`;
}

export function makeProduto(overrides: Partial<Produto> = {}): Produto {
  return {
    id: 1,
    nome: "Arroz tipo 1 5kg",
    descricao: "",
    categoria: "MERCEARIA",
    preco: "24.90",
    sku: "MRC-0001",
    codigo_barras: "",
    ativo: true,
    foto: null,
    data_criacao: "2026-10-01T10:00:00-03:00",
    data_atualizacao: "2026-10-01T10:00:00-03:00",
    ...overrides,
  };
}
