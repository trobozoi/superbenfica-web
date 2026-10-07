import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addItem,
  type CartItem,
  type CartProduct,
  removeItem,
  updateQuantity,
} from "@/lib/services/cart.service";

interface CartState {
  items: CartItem[];
  add: (produto: CartProduct, quantidade?: number) => void;
  setQuantity: (produtoId: number, quantidade: number) => void;
  remove: (produtoId: number) => void;
  clear: () => void;
}

/**
 * Carrinho persistido no localStorage (sobrevive a recarregar a página).
 *
 * A API ainda não tem endpoint de carrinho (/api/carts/ do documento não existe), então
 * a sincronização entre dispositivos fica para quando o backend oferecer esse recurso.
 * Só dados não sensíveis ficam aqui: ids, nomes, preços e quantidades.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (produto, quantidade = 1) =>
        set((state) => ({ items: addItem(state.items, produto, quantidade) })),
      setQuantity: (produtoId, quantidade) =>
        set((state) => ({ items: updateQuantity(state.items, produtoId, quantidade) })),
      remove: (produtoId) => set((state) => ({ items: removeItem(state.items, produtoId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "sb_cart",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      // Hidratação manual (CartHydrator) evita diferença entre HTML do servidor e do cliente.
      skipHydration: true,
    },
  ),
);
