import { QueryClient } from "@tanstack/react-query";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { logout, resetLocalState } from "@/lib/services/auth.service";
import { useCartStore } from "@/stores/cartStore";
import { unreadCount, useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";
import { makeProduto } from "../helpers";

describe("stores", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.getState().clear();
    useNotificationStore.getState().clear();
    useUserStore.getState().clear();
  });

  it("cartStore adiciona, altera, remove e persiste no localStorage", async () => {
    const cart = useCartStore.getState();
    cart.add(makeProduto({ id: 1 }), 2);
    cart.add(makeProduto({ id: 2 }));
    useCartStore.getState().setQuantity(1, 5);
    useCartStore.getState().remove(2);

    expect(useCartStore.getState().items).toEqual([
      expect.objectContaining({ produtoId: 1, quantidade: 5 }),
    ]);
    const raw = localStorage.getItem("sb_cart") ?? "{}";
    expect((JSON.parse(raw) as { state: unknown }).state).toEqual({
      items: useCartStore.getState().items,
    });

    // Simula recarregar a página: memória vazia, localStorage com o carrinho salvo.
    useCartStore.setState({ items: [] });
    localStorage.setItem("sb_cart", raw);
    await useCartStore.persist.rehydrate();
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it("notificationStore guarda as mais recentes primeiro e conta não lidas", () => {
    const store = useNotificationStore.getState();
    for (let index = 0; index < 35; index += 1) store.push({ title: `Evento ${index}` });
    const { items } = useNotificationStore.getState();
    expect(items).toHaveLength(30);
    expect(items[0]?.title).toBe("Evento 34");
    expect(unreadCount(items)).toBe(30);

    useNotificationStore.getState().markAllRead();
    expect(unreadCount(useNotificationStore.getState().items)).toBe(0);

    useNotificationStore.getState().setConnection("open");
    expect(useNotificationStore.getState().connection).toBe("open");
  });

  it("logout limpa sessão, carrinho, notificações e cache", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({ status: 204 });
    const queryClient = new QueryClient();
    queryClient.setQueryData(["pedidos"], [1]);
    useUserStore.getState().setUser({ id: 1, nome: "A", role: "CLIENTE", lojaId: 1, exp: 1 });
    useCartStore.getState().add(makeProduto());
    useNotificationStore.getState().push({ title: "x" });

    await logout(queryClient);

    expect(axios.post).toHaveBeenCalledWith("/api/auth/logout", null, expect.anything());
    expect(useUserStore.getState().user).toBeNull();
    expect(useCartStore.getState().items).toEqual([]);
    expect(useNotificationStore.getState().items).toEqual([]);
    expect(queryClient.getQueryData(["pedidos"])).toBeUndefined();
  });

  it("resetLocalState funciona mesmo sem chamar a API", () => {
    useCartStore.getState().add(makeProduto());
    resetLocalState(new QueryClient());
    expect(useCartStore.getState().items).toEqual([]);
  });
});
