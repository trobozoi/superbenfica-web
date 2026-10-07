"use client";

import { useMemo } from "react";
import { cartTotals } from "@/lib/services/cart.service";
import { useCartStore } from "@/stores/cartStore";

/** Itens, totais e ações do carrinho. */
export function useCart() {
  const items = useCartStore((state) => state.items);
  const add = useCartStore((state) => state.add);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const remove = useCartStore((state) => state.remove);
  const clear = useCartStore((state) => state.clear);
  const totals = useMemo(() => cartTotals(items), [items]);

  return { items, totals, add, setQuantity, remove, clear, isEmpty: items.length === 0 };
}
