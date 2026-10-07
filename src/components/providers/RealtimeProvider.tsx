"use client";

import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { authApi } from "@/lib/api/auth";
import { queryKeys } from "@/lib/hooks/queryKeys";
import { publicEnv } from "@/lib/env";
import { RealtimeClient } from "@/lib/services/socket.service";
import { pedidoStatusLabel, ROUTES, WS_CHANNELS } from "@/lib/utils/constants";
import { useNotificationStore } from "@/stores/notificationStore";
import { useUserStore } from "@/stores/userStore";
import type { RealtimeMessage } from "@/types/realtime";

/**
 * Conecta ao canal /ws/notificacoes/ enquanto houver sessão e transforma os eventos
 * dos pedidos do cliente em: invalidação do cache (telas se atualizam sozinhas),
 * notificação no sino do cabeçalho e um toast.
 */
export function RealtimeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.user?.id ?? null);

  useEffect(() => {
    const { setConnection, push } = useNotificationStore.getState();
    if (userId === null) {
      setConnection("idle");
      return undefined;
    }

    const handleMessage = (message: RealtimeMessage) => {
      if (message.evento === "pong") return;
      const { pedido_id: pedidoId, codigo, status, tipo_entrega: tipoEntrega } = message.dados;
      void queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.all });
      const title =
        message.evento === "pedido.criado"
          ? `Pedido ${codigo} recebido`
          : `Pedido ${codigo}: ${pedidoStatusLabel(status, tipoEntrega)}`;
      push({ title, href: ROUTES.pedido(pedidoId) });
      toast.info(title);
    };

    const client = new RealtimeClient({
      url: `${publicEnv.NEXT_PUBLIC_WS_URL}${WS_CHANNELS.notificacoes}`,
      getToken: () => authApi.getRealtimeToken(),
      onMessage: handleMessage,
      onStatusChange: setConnection,
    });
    void client.connect();
    return () => client.disconnect();
  }, [userId, queryClient]);

  return children;
}
