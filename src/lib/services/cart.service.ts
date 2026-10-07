import { MAX_ITEM_QUANTITY } from "@/lib/utils/constants";
import { toNumber } from "@/lib/utils/format";
import type { PedidoCreateInput } from "@/types/api";
import type { Produto, TipoEntrega } from "@/types/entities";

/**
 * Regras do carrinho como funções puras (imutáveis), usadas pelo cartStore.
 * Ficam fora do store para serem testadas sem React e reaproveitadas no checkout.
 */

export interface CartItem {
  produtoId: number;
  nome: string;
  /** Preço no momento em que o item entrou no carrinho. O valor final é o da API no pedido. */
  preco: string;
  foto: string | null;
  quantidade: number;
}

export interface CartTotals {
  /** Quantidade total de unidades. */
  count: number;
  subtotal: number;
}

export function clampQuantity(quantidade: number): number {
  if (!Number.isFinite(quantidade)) return 1;
  return Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.trunc(quantidade)));
}

/** Campos do produto que o carrinho guarda. */
export type CartProduct = Pick<Produto, "id" | "nome" | "preco" | "foto">;

export function addItem(
  items: readonly CartItem[],
  produto: CartProduct,
  quantidade = 1,
): CartItem[] {
  const existing = items.find((item) => item.produtoId === produto.id);
  if (existing) {
    return updateQuantity(items, produto.id, existing.quantidade + quantidade);
  }
  return [
    ...items,
    {
      produtoId: produto.id,
      nome: produto.nome,
      preco: produto.preco,
      foto: produto.foto,
      quantidade: clampQuantity(quantidade),
    },
  ];
}

/** Quantidade menor que 1 remove o item. */
export function updateQuantity(
  items: readonly CartItem[],
  produtoId: number,
  quantidade: number,
): CartItem[] {
  if (quantidade < 1) return removeItem(items, produtoId);
  return items.map((item) =>
    item.produtoId === produtoId ? { ...item, quantidade: clampQuantity(quantidade) } : item,
  );
}

export function removeItem(items: readonly CartItem[], produtoId: number): CartItem[] {
  return items.filter((item) => item.produtoId !== produtoId);
}

export function lineTotal(item: CartItem): number {
  return toNumber(item.preco) * item.quantidade;
}

/** Soma em centavos para evitar erros de ponto flutuante (0.1 + 0.2). */
export function cartTotals(items: readonly CartItem[]): CartTotals {
  let cents = 0;
  let count = 0;
  for (const item of items) {
    cents += Math.round(toNumber(item.preco) * 100) * item.quantidade;
    count += item.quantidade;
  }
  return { count, subtotal: cents / 100 };
}

/** Monta o corpo de POST /api/pedidos/ a partir do carrinho. */
export function toOrderPayload(
  items: readonly CartItem[],
  options: {
    loja: number;
    formaPagamento: number;
    observacao?: string;
    tipoEntrega?: TipoEntrega;
    endereco?: number;
  },
): PedidoCreateInput {
  const tipoEntrega = options.tipoEntrega ?? "RETIRADA";
  return {
    loja: options.loja,
    forma_pagamento: options.formaPagamento,
    itens: items.map((item) => ({ produto: item.produtoId, quantidade: item.quantidade })),
    observacao: options.observacao?.trim() ?? "",
    tipo_entrega: tipoEntrega,
    // O endereço só vale para entrega em domicílio; na retirada nem é enviado.
    ...(tipoEntrega === "DOMICILIO" && options.endereco ? { endereco: options.endereco } : {}),
  };
}
