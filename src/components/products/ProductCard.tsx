"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/hooks/useCart";
import { CATEGORIA_LABELS, ROUTES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";
import type { Produto } from "@/types/entities";
import { ProductImage } from "./ProductImage";

export function ProductCard({ produto }: Readonly<{ produto: Produto }>) {
  const { add } = useCart();

  const handleAdd = () => {
    add(produto);
    toast.success(`${produto.nome} adicionado ao carrinho.`);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-xs transition-shadow hover:shadow-md">
      <Link
        href={ROUTES.produto(produto.id)}
        className="outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <ProductImage foto={produto.foto} nome={produto.nome} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <span className="text-xs text-muted-foreground">{CATEGORIA_LABELS[produto.categoria]}</span>
        <h3 className="line-clamp-2 text-sm font-medium">
          <Link href={ROUTES.produto(produto.id)} className="hover:underline">
            {produto.nome}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-lg font-bold">{formatCurrency(produto.preco)}</span>
          <Button
            size="icon"
            onClick={handleAdd}
            aria-label={`Adicionar ${produto.nome} ao carrinho`}
          >
            <Plus />
          </Button>
        </div>
      </div>
    </article>
  );
}
