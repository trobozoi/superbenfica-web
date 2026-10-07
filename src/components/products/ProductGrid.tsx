import { PackageSearch } from "lucide-react";
import { EmptyState, Skeleton } from "@/components/ui/Feedback";
import type { Produto } from "@/types/entities";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  produtos: Produto[] | undefined;
  loading?: boolean;
}

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function ProductGrid({ produtos, loading = false }: Readonly<ProductGridProps>) {
  if (loading && !produtos) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true">
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    );
  }

  if (!produtos || produtos.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch />}
        title="Nenhum produto encontrado"
        description="Tente outro termo de busca ou remova os filtros."
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {produtos.map((produto) => (
        <li key={produto.id} className="flex">
          <ProductCard produto={produto} />
        </li>
      ))}
    </ul>
  );
}
