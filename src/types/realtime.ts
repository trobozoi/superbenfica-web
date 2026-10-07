import type { PedidoStatus, TipoEntrega } from "./entities";

/**
 * Eventos do canal /ws/notificacoes/ (Django Channels): o cliente recebe os eventos
 * dos próprios pedidos. Formato: {"evento": "...", "dados": {...}}.
 */
export const REALTIME_EVENTS = ["pedido.criado", "pedido.atualizado", "pong"] as const;
export type RealtimeEventName = (typeof REALTIME_EVENTS)[number];

export interface PedidoEventData {
  pedido_id: number;
  codigo: string;
  status: PedidoStatus;
  tipo_entrega: TipoEntrega;
}

export type RealtimeMessage =
  | { evento: "pedido.criado" | "pedido.atualizado"; dados: PedidoEventData }
  | { evento: "pong"; dados: Record<string, never> };

export type ConnectionStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed";
