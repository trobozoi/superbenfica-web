import { ENDPOINTS } from "@/lib/utils/constants";
import type { Paginated, ProdutoFilters } from "@/types/api";
import type { Produto } from "@/types/entities";
import { http } from "./client";

/** Remove filtros vazios para não enviar ?search=&categoria= à API. */
function cleanParams(filters: ProdutoFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params[key] = value as string | number;
  }
  return params;
}

export const productsApi = {
  /** Para CLIENTE a API já devolve só os produtos ativos. */
  async list(filters: ProdutoFilters = {}): Promise<Paginated<Produto>> {
    const { data } = await http.get<Paginated<Produto>>(ENDPOINTS.produtos, {
      params: cleanParams(filters),
    });
    return data;
  },

  async get(id: number): Promise<Produto> {
    const { data } = await http.get<Produto>(ENDPOINTS.produto(id));
    return data;
  },
};
