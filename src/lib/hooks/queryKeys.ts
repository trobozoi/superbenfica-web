import type { ProdutoFilters } from "@/types/api";

/** Chaves do TanStack Query centralizadas: invalidar por prefixo atinge toda a família. */
export const queryKeys = {
  produtos: {
    all: ["produtos"] as const,
    list: (filters: ProdutoFilters) => ["produtos", "list", filters] as const,
    detail: (id: number) => ["produtos", "detail", id] as const,
  },
  pedidos: {
    all: ["pedidos"] as const,
    list: (page: number) => ["pedidos", "list", page] as const,
    detail: (id: number) => ["pedidos", "detail", id] as const,
  },
  lojas: ["lojas"] as const,
  formasPagamento: ["formas-pagamento"] as const,
  perfil: ["perfil"] as const,
  enderecos: ["enderecos"] as const,
};
