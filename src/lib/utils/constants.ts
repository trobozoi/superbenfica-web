import type { Categoria, PedidoStatus, TipoEntrega } from "@/types/entities";

/**
 * Endpoints da API Django (relativos a /api/, sem barra final).
 * Fonte: superbenfica-api/docs/openapi.yaml. Confira lá ao adicionar rotas.
 *
 * No navegador as chamadas passam pelo BFF (/api/proxy/<endpoint>), que anexa o token
 * do cookie httpOnly e adiciona a barra final exigida pelo Django.
 */
export const AUTH_ENDPOINTS = {
  token: "auth/token",
  refresh: "auth/token/refresh",
  logout: "auth/logout",
  registrar: "auth/registrar",
} as const;

export const ENDPOINTS = {
  usuarioMe: "usuarios/me",
  lojas: "lojas",
  produtos: "produtos",
  produto: (id: number) => `produtos/${id}`,
  clientes: "clientes",
  cliente: (id: number) => `clientes/${id}`,
  enderecos: "enderecos",
  endereco: (id: number) => `enderecos/${id}`,
  formasPagamento: "formas-pagamento",
  pedidos: "pedidos",
  pedido: (id: number) => `pedidos/${id}`,
  pedidoCancelar: (id: number) => `pedidos/${id}/cancelar`,
} as const;

/**
 * Recursos que o proxy do BFF aceita encaminhar (primeiro segmento do caminho).
 * Defesa em profundidade: mesmo que a API já restrinja por perfil, a loja não expõe
 * rotas de gestão (estoque, relatórios, usuários etc.).
 */
export const PROXY_ALLOWED_RESOURCES = new Set([
  "usuarios",
  "lojas",
  "produtos",
  "clientes",
  "enderecos",
  "formas-pagamento",
  "pedidos",
]);

/** Canal WebSocket com os eventos dos pedidos do próprio usuário. */
export const WS_CHANNELS = {
  notificacoes: "/ws/notificacoes/",
} as const;

/** Rotas internas do BFF (Next route handlers). */
export const BFF_ROUTES = {
  proxy: "/api/proxy",
  login: "/api/auth/login",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  register: "/api/auth/register",
  wsToken: "/api/auth/ws-token",
  media: "/api/media",
} as const;

/** Rotas de página. */
export const ROUTES = {
  home: "/",
  login: "/entrar",
  register: "/cadastro",
  produtos: "/produtos",
  produto: (id: number) => `/produtos/${id}`,
  carrinho: "/carrinho",
  checkout: "/checkout",
  pedidos: "/pedidos",
  pedido: (id: number) => `/pedidos/${id}`,
  perfil: "/perfil",
} as const;

/** Páginas que exigem login (verificadas em src/proxy.ts). */
export const PROTECTED_PREFIXES = [
  ROUTES.produtos,
  ROUTES.carrinho,
  ROUTES.checkout,
  ROUTES.pedidos,
  ROUTES.perfil,
] as const;

/** Tamanho de página fixo da API (REST_FRAMEWORK.PAGE_SIZE). */
export const API_PAGE_SIZE = 20;

/** Limite da API por item de pedido (ItemPedidoEntrada.quantidade). */
export const MAX_ITEM_QUANTITY = 999;

/** Cache do TanStack Query (requisito: produtos 5 min). */
export const CACHE_TIMES = {
  produtos: 5 * 60_000,
  referencia: 10 * 60_000,
  pedidos: 30_000,
} as const;

export const CATEGORIA_LABELS: Record<Categoria, string> = {
  HORTIFRUTI: "Hortifrúti",
  MERCEARIA: "Mercearia",
  BEBIDAS: "Bebidas",
  LATICINIOS: "Laticínios e frios",
  PADARIA: "Padaria",
  ACOUGUE: "Açougue",
  LIMPEZA: "Limpeza",
  HIGIENE: "Higiene e beleza",
};

export const PEDIDO_STATUS_LABELS: Record<PedidoStatus, string> = {
  PENDENTE: "Pendente",
  EM_SEPARACAO: "Em separação",
  SEPARADO: "Pronto para retirada",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
};

/** Separado, o pedido de entrega em domicílio aguarda sair da loja, não a retirada. */
export function pedidoStatusLabel(status: PedidoStatus, tipoEntrega: TipoEntrega): string {
  if (status === "SEPARADO" && tipoEntrega === "DOMICILIO") return "Pronto para entrega";
  return PEDIDO_STATUS_LABELS[status];
}
