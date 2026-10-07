import { describe, expect, it } from "vitest";
import {
  addItem,
  cartTotals,
  clampQuantity,
  lineTotal,
  removeItem,
  toOrderPayload,
  updateQuantity,
} from "@/lib/services/cart.service";
import { makeProduto } from "../helpers";

describe("cart.service", () => {
  const arroz = makeProduto({ id: 1, preco: "24.90" });
  const feijao = makeProduto({ id: 2, nome: "Feijão 1kg", preco: "8.49" });

  it("adiciona um produto novo com a quantidade informada", () => {
    const items = addItem([], arroz, 2);
    expect(items).toEqual([
      { produtoId: 1, nome: arroz.nome, preco: "24.90", foto: null, quantidade: 2 },
    ]);
  });

  it("soma a quantidade quando o produto já está no carrinho", () => {
    const items = addItem(addItem([], arroz, 1), arroz, 3);
    expect(items).toHaveLength(1);
    expect(items[0]?.quantidade).toBe(4);
  });

  it("não altera o array original (imutável)", () => {
    const original = addItem([], arroz);
    addItem(original, feijao);
    expect(original).toHaveLength(1);
  });

  it("atualiza a quantidade e remove quando fica abaixo de 1", () => {
    const items = addItem([], arroz, 2);
    expect(updateQuantity(items, 1, 5)[0]?.quantidade).toBe(5);
    expect(updateQuantity(items, 1, 0)).toEqual([]);
  });

  it("remove um item específico", () => {
    const items = addItem(addItem([], arroz), feijao);
    expect(removeItem(items, 1).map((item) => item.produtoId)).toEqual([2]);
  });

  it("limita a quantidade entre 1 e 999 (limite da API)", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(5000)).toBe(999);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });

  it("calcula totais sem erro de ponto flutuante", () => {
    const items = addItem(
      addItem([], makeProduto({ id: 3, preco: "0.10" }), 1),
      makeProduto({ id: 4, preco: "0.20" }),
      1,
    );
    expect(cartTotals(items)).toEqual({ count: 2, subtotal: 0.3 });
  });

  it("calcula o total da linha", () => {
    const [item] = addItem([], feijao, 3);
    expect(item && lineTotal(item)).toBeCloseTo(25.47);
  });

  it("monta o corpo de POST /api/pedidos/", () => {
    const items = addItem(addItem([], arroz, 2), feijao, 1);
    expect(
      toOrderPayload(items, { loja: 1, formaPagamento: 3, observacao: "  sem sacolas " }),
    ).toEqual({
      loja: 1,
      forma_pagamento: 3,
      itens: [
        { produto: 1, quantidade: 2 },
        { produto: 2, quantidade: 1 },
      ],
      observacao: "sem sacolas",
      tipo_entrega: "RETIRADA",
    });
    expect(toOrderPayload(items, { loja: 1, formaPagamento: 3 }).observacao).toBe("");
  });

  it("envia o endereço só na entrega em domicílio", () => {
    const items = addItem([], arroz, 1);
    const base = { loja: 1, formaPagamento: 3, endereco: 7 };
    expect(toOrderPayload(items, { ...base, tipoEntrega: "DOMICILIO" })).toMatchObject({
      tipo_entrega: "DOMICILIO",
      endereco: 7,
    });
    expect(toOrderPayload(items, { ...base, tipoEntrega: "RETIRADA" })).not.toHaveProperty(
      "endereco",
    );
  });
});
