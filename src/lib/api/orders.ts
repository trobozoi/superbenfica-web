import { ENDPOINTS } from "@/lib/utils/constants";
import type { Paginated, PedidoCreateInput } from "@/types/api";
import type { Pedido } from "@/types/entities";
import { http } from "./client";

export const ordersApi = {
  /** Para CLIENTE a API devolve somente os próprios pedidos. */
  async list(page = 1): Promise<Paginated<Pedido>> {
    const { data } = await http.get<Paginated<Pedido>>(ENDPOINTS.pedidos, {
      params: { page, ordering: "-data_criacao" },
    });
    return data;
  },

  async get(id: number): Promise<Pedido> {
    const { data } = await http.get<Pedido>(ENDPOINTS.pedido(id));
    return data;
  },

  /** 409 = estoque insuficiente ou produto indisponível; 400 = dados inválidos. */
  async create(input: PedidoCreateInput): Promise<Pedido> {
    const { data } = await http.post<Pedido>(ENDPOINTS.pedidos, input);
    return data;
  },

  /** O cliente só pode cancelar pedidos com status PENDENTE (409 nos demais). */
  async cancel(id: number): Promise<Pedido> {
    const { data } = await http.post<Pedido>(ENDPOINTS.pedidoCancelar(id));
    return data;
  },
};
