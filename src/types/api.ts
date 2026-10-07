import type { Categoria, Role, TipoEntrega, Uf } from "./entities";

/** Envelope de paginação do DRF (PageNumberPagination, 20 itens por página). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Parâmetros aceitos por GET /api/produtos/. */
export interface ProdutoFilters {
  page?: number;
  search?: string;
  categoria?: Categoria;
  ordering?: "nome" | "-nome" | "preco" | "-preco" | "-data_criacao";
}

/** Corpo de POST /api/pedidos/ (CLIENTE: o pedido é feito em seu nome). */
export interface PedidoCreateInput {
  loja: number;
  forma_pagamento: number;
  itens: { produto: number; quantidade: number }[];
  observacao?: string;
  /** Padrão na API: RETIRADA. */
  tipo_entrega?: TipoEntrega;
  /** ID de um endereço do cliente; obrigatório quando tipo_entrega é DOMICILIO. */
  endereco?: number;
}

/** Corpo de POST /api/auth/registrar/. */
export interface RegistroInput {
  nome: string;
  email: string;
  password: string;
  telefone?: string;
  loja?: number | null;
}

export interface EnderecoInput {
  cliente: number;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: Uf;
  cep: string;
  principal?: boolean;
}

/** Usuário autenticado, extraído das claims do access token (nome, role, loja_id). */
export interface SessionUser {
  id: number;
  nome: string;
  role: Role;
  lojaId: number | null;
  /** Expiração do access token (epoch em segundos). */
  exp: number;
}

export interface LoginInput {
  email: string;
  password: string;
}
