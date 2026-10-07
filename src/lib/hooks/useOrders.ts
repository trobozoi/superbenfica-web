"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import { CACHE_TIMES } from "@/lib/utils/constants";
import type { PedidoCreateInput } from "@/types/api";
import { queryKeys } from "./queryKeys";

export function useOrders(page = 1) {
  return useQuery({
    queryKey: queryKeys.pedidos.list(page),
    queryFn: () => ordersApi.list(page),
    staleTime: CACHE_TIMES.pedidos,
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: queryKeys.pedidos.detail(id),
    queryFn: () => ordersApi.get(id),
    staleTime: CACHE_TIMES.pedidos,
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: PedidoCreateInput) => ordersApi.create(input),
    onSuccess: (pedido) => {
      queryClient.setQueryData(queryKeys.pedidos.detail(pedido.id), pedido);
      void queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.all });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: (pedido) => {
      queryClient.setQueryData(queryKeys.pedidos.detail(pedido.id), pedido);
      void queryClient.invalidateQueries({ queryKey: queryKeys.pedidos.all });
    },
  });
}
