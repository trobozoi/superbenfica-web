"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/catalog";
import { CACHE_TIMES } from "@/lib/utils/constants";
import { queryKeys } from "./queryKeys";

/** Lojas ativas (o cliente escolhe onde retirar o pedido). */
export function useLojas() {
  return useQuery({
    queryKey: queryKeys.lojas,
    queryFn: catalogApi.lojas,
    staleTime: CACHE_TIMES.referencia,
  });
}

export function useFormasPagamento() {
  return useQuery({
    queryKey: queryKeys.formasPagamento,
    queryFn: catalogApi.formasPagamento,
    staleTime: CACHE_TIMES.referencia,
  });
}
