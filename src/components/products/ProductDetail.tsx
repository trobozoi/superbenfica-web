"use client";

import { ArrowLeft, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { QuantityInput } from "@/components/cart/QuantityInput";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/Feedback";
import { toApiError } from "@/lib/api/errors";
import { useCart } from "@/lib/hooks/useCart";
import { useProduct } from "@/lib/hooks/useProducts";
import { CATEGORIA_LABELS, ROUTES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";
import { ProductImage } from "./ProductImage";

export function ProductDetail({ id }: Readonly<{ id: number }>) {
  const { data: produto, isPending, error } = useProduct(id);
  const { add } = useCart();
  const [quantidade, setQuantidade] = useState(1);

  if (error) {
    const apiError = toApiError(error);
    return apiError.status === 404 ? (
      <EmptyState
        title="Produto não encontrado"
        description="Ele pode ter sido removido do catálogo."
        action={<Link href={ROUTES.produtos}>Voltar ao catálogo</Link>}
      />
    ) : (
      <ErrorMessage message={apiError.message} />
    );
  }
  if (isPending) return <Skeleton className="h-96" />;

  const handleAdd = () => {
    add(produto, quantidade);
    toast.success(`${quantidade}× ${produto.nome} no carrinho.`);
    setQuantidade(1);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ROUTES.produtos}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Voltar ao catálogo
      </Link>
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          foto={produto.foto}
          nome={produto.nome}
          className="rounded-xl border"
          sizes="(min-width: 768px) 50vw, 100vw"
          priority
        />
        <div className="flex flex-col gap-4">
          <span className="text-sm text-muted-foreground">
            {CATEGORIA_LABELS[produto.categoria]}
          </span>
          <h1 className="text-2xl font-bold sm:text-3xl">{produto.nome}</h1>
          <p className="text-3xl font-bold text-primary">{formatCurrency(produto.preco)}</p>
          {produto.descricao && <p className="text-muted-foreground">{produto.descricao}</p>}
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted-foreground">SKU</dt>
            <dd>{produto.sku}</dd>
            {produto.codigo_barras && (
              <>
                <dt className="text-muted-foreground">Código de barras</dt>
                <dd>{produto.codigo_barras}</dd>
              </>
            )}
          </dl>
          <div className="flex flex-wrap items-center gap-3">
            <QuantityInput label="Quantidade" value={quantidade} onChange={setQuantidade} min={1} />
            <Button size="lg" onClick={handleAdd}>
              <ShoppingCart /> Adicionar ao carrinho
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A disponibilidade é confirmada pela loja ao registrar o pedido.
          </p>
        </div>
      </div>
    </div>
  );
}
