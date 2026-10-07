"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { ProductImage } from "@/components/products/ProductImage";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/lib/hooks/useCart";
import { type CartItem as CartItemType, lineTotal } from "@/lib/services/cart.service";
import { ROUTES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";
import { QuantityInput } from "./QuantityInput";

export function CartItem({ item }: Readonly<{ item: CartItemType }>) {
  const { setQuantity, remove } = useCart();
  return (
    <li className="flex gap-4 py-4">
      <ProductImage
        foto={item.foto}
        nome={item.nome}
        className="size-20 shrink-0 rounded-md"
        sizes="80px"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex justify-between gap-2">
          <Link
            href={ROUTES.produto(item.produtoId)}
            className="line-clamp-2 font-medium hover:underline"
          >
            {item.nome}
          </Link>
          <span className="shrink-0 font-semibold">{formatCurrency(lineTotal(item))}</span>
        </div>
        <span className="text-sm text-muted-foreground">{formatCurrency(item.preco)} / un.</span>
        <div className="flex items-center justify-between">
          <QuantityInput
            label={`Quantidade de ${item.nome}`}
            value={item.quantidade}
            onChange={(value) => setQuantity(item.produtoId, value)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => remove(item.produtoId)}
            aria-label={`Remover ${item.nome}`}
          >
            <Trash2 /> Remover
          </Button>
        </div>
      </div>
    </li>
  );
}
