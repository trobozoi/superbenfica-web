"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api/products";
import { CACHE_TIMES } from "@/lib/utils/constants";
import type { ProdutoFilters } from "@/types/api";
import { queryKeys } from "./queryKeys";

/** Lista paginada do catálogo. Mantém a página anterior na tela enquanto a próxima carrega. */
export function useProducts(filters: ProdutoFilters) {
  return useQuery({
    queryKey: queryKeys.produtos.list(filters),
    queryFn: () => productsApi.list(filters),
    staleTime: CACHE_TIMES.produtos,
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: queryKeys.produtos.detail(id),
    queryFn: () => productsApi.get(id),
    staleTime: CACHE_TIMES.produtos,
    enabled: Number.isInteger(id) && id > 0,
  });
}

/** Sugestões do autocomplete (até 6 resultados, só a partir de 2 letras). */
export function useProductSuggestions(term: string) {
  const search = term.trim();
  return useQuery({
    queryKey: queryKeys.produtos.list({ search, page: 1 }),
    queryFn: () => productsApi.list({ search, page: 1 }),
    staleTime: CACHE_TIMES.produtos,
    enabled: search.length >= 2,
    select: (data) => data.results.slice(0, 6),
  });
}
