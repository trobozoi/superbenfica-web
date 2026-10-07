import type { QueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api/auth";
import { useCartStore } from "@/stores/cartStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";

/**
 * Encerra a sessão e apaga o estado local inteiro do usuário: dados em cache, carrinho e
 * notificações. Importante em computadores compartilhados (LGPD: dados pessoais não
 * devem ficar visíveis para a próxima pessoa).
 */
export function resetLocalState(queryClient: QueryClient): void {
  useUserStore.getState().clear();
  useCartStore.getState().clear();
  useNotificationStore.getState().clear();
  queryClient.clear();
}

export async function logout(queryClient: QueryClient): Promise<void> {
  await authApi.logout();
  resetLocalState(queryClient);
}
