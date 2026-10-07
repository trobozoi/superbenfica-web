import { ENDPOINTS } from "@/lib/utils/constants";
import type { Paginated } from "@/types/api";
import type { FormaPagamento, Loja } from "@/types/entities";
import { http } from "./client";

/** Dados de referência: lojas (filiais) e formas de pagamento ativas. */
export const catalogApi = {
  async lojas(): Promise<Loja[]> {
    const { data } = await http.get<Paginated<Loja>>(ENDPOINTS.lojas, {
      params: { ativa: true, ordering: "nome" },
    });
    return data.results;
  },

  async formasPagamento(): Promise<FormaPagamento[]> {
    const { data } = await http.get<Paginated<FormaPagamento>>(ENDPOINTS.formasPagamento, {
      params: { ativa: true, ordering: "ordem" },
    });
    return data.results;
  },
};
