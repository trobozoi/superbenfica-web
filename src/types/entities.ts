/**
 * Entidades da API Django, espelhando os serializers.
 * Fonte: superbenfica-api/docs/openapi.yaml (ou GET /api/schema/). Confira lá ao mudar.
 *
 * Decimais chegam como string ("12.90"): use toNumber/formatCurrency de lib/utils/format.
 */

export const ROLES = ["ADMIN", "GERENTE", "SEPARADOR", "CAIXA", "CLIENTE"] as const;
export type Role = (typeof ROLES)[number];

export const CATEGORIAS = [
  "HORTIFRUTI",
  "MERCEARIA",
  "BEBIDAS",
  "LATICINIOS",
  "PADARIA",
  "ACOUGUE",
  "LIMPEZA",
  "HIGIENE",
] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export const PEDIDO_STATUS = [
  "PENDENTE",
  "EM_SEPARACAO",
  "SEPARADO",
  "SAIU_PARA_ENTREGA",
  "FINALIZADO",
  "CANCELADO",
] as const;
export type PedidoStatus = (typeof PEDIDO_STATUS)[number];

export const TIPOS_PAGAMENTO = [
  "PIX",
  "CREDITO",
  "DEBITO",
  "DINHEIRO",
  "VALE_ALIMENTACAO",
] as const;
export type TipoPagamento = (typeof TIPOS_PAGAMENTO)[number];

export const UFS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;
export type Uf = (typeof UFS)[number];

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  categoria: Categoria;
  preco: string;
  sku: string;
  codigo_barras: string;
  ativo: boolean;
  /** URL absoluta da foto na API, ou null. Use mediaSrc() para exibir. */
  foto: string | null;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Loja {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
  horario_abertura: string;
  horario_fechamento: string;
  ativa: boolean;
}

export interface FormaPagamento {
  id: number;
  nome: string;
  tipo: TipoPagamento;
  tipo_display: string;
  permite_troco: boolean;
  ativa: boolean;
  ordem: number;
}

export interface EnderecoCliente {
  id: number;
  cliente: number;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: Uf;
  cep: string;
  principal: boolean;
}

export interface Cliente {
  id: number;
  usuario: number | null;
  nome: string;
  email: string;
  telefone: string;
  /** Loja preferida. */
  loja: number | null;
  data_cadastro: string;
  enderecos: EnderecoCliente[];
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  loja: number | null;
  loja_nome: string;
  role: Role;
  is_active: boolean;
  data_cadastro: string;
}

export interface ItemPedido {
  id: number;
  produto: number;
  produto_nome: string;
  produto_sku: string;
  produto_codigo_barras: string;
  quantidade: number;
  preco_unitario: string;
  subtotal: string;
  separado: boolean;
}

/** Como o cliente recebe o pedido. Pedidos antigos (sem o campo) são RETIRADA. */
export const TIPOS_ENTREGA = ["RETIRADA", "DOMICILIO"] as const;
export type TipoEntrega = (typeof TIPOS_ENTREGA)[number];

export interface Pedido {
  id: number;
  codigo: string;
  cliente: number;
  cliente_nome: string;
  loja: number;
  loja_nome: string;
  status: PedidoStatus;
  forma_pagamento: number | null;
  forma_pagamento_nome: string;
  tipo_entrega: TipoEntrega;
  /** Cópia do endereço no momento da compra (vazio na retirada). */
  endereco_entrega: string;
  observacao: string;
  itens: ItemPedido[];
  total: string;
  data_criacao: string;
  data_atualizacao: string;
}
