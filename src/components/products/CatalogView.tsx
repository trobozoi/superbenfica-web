"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ErrorMessage } from "@/components/ui/Feedback";
import { Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { toApiError } from "@/lib/api/errors";
import { useProducts } from "@/lib/hooks/useProducts";
import { CATEGORIAS, type Categoria } from "@/types/entities";
import type { ProdutoFilters } from "@/types/api";
import { CategoryFilter } from "./CategoryFilter";
import { ProductGrid } from "./ProductGrid";
import { ProductSearch } from "./ProductSearch";

const ORDERINGS: { value: NonNullable<ProdutoFilters["ordering"]>; label: string }[] = [
  { value: "nome", label: "Nome (A-Z)" },
  { value: "preco", label: "Menor preço" },
  { value: "-preco", label: "Maior preço" },
  { value: "-data_criacao", label: "Novidades" },
];

function parseFilters(params: URLSearchParams): ProdutoFilters {
  const categoria = params.get("categoria");
  const ordering = params.get("ordering");
  const page = Number(params.get("page") ?? 1);
  return {
    search: params.get("search") ?? undefined,
    categoria: (CATEGORIAS as readonly string[]).includes(categoria ?? "")
      ? (categoria as Categoria)
      : undefined,
    ordering: ORDERINGS.some((o) => o.value === ordering)
      ? (ordering as ProdutoFilters["ordering"])
      : "nome",
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

/**
 * Catálogo com busca, filtro por categoria, ordenação e paginação.
 * Os filtros ficam na URL: dá para compartilhar o link e o botão "voltar" funciona.
 */
export function CatalogView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseFilters(params);
  const { data, isPending, isFetching, error } = useProducts(filters);

  const update = useCallback(
    (changes: Partial<ProdutoFilters>) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries({ page: undefined, ...changes })) {
        if (value === undefined || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      const query = next.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <ProductSearch
          key={filters.search ?? ""}
          initialValue={filters.search}
          onSearch={(search) => update({ search })}
        />
        <label className="sr-only" htmlFor="ordenacao">
          Ordenar por
        </label>
        <Select
          id="ordenacao"
          className="sm:w-48"
          value={filters.ordering}
          onChange={(event) =>
            update({ ordering: event.target.value as ProdutoFilters["ordering"] })
          }
        >
          {ORDERINGS.map((ordering) => (
            <option key={ordering.value} value={ordering.value}>
              {ordering.label}
            </option>
          ))}
        </Select>
      </div>

      <CategoryFilter value={filters.categoria} onChange={(categoria) => update({ categoria })} />

      {error ? (
        <ErrorMessage message={toApiError(error).message} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {data ? `${data.count} produto(s) encontrado(s)` : "Carregando produtos…"}
            {isFetching && data ? " · atualizando…" : ""}
          </p>
          <ProductGrid produtos={data?.results} loading={isPending} />
          {data && (
            <Pagination
              page={filters.page ?? 1}
              count={data.count}
              onPageChange={(page) => update({ page })}
            />
          )}
        </>
      )}
    </div>
  );
}
