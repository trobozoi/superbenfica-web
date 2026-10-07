"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Popover } from "@/components/layout/Popover";
import { buttonVariants } from "@/components/ui/Button";
import { useCart } from "@/lib/hooks/useCart";
import { lineTotal } from "@/lib/services/cart.service";
import { ROUTES } from "@/lib/utils/constants";
import { formatCurrency } from "@/lib/utils/format";

const PREVIEW_ITEMS = 4;

/** Ícone do carrinho no cabeçalho com uma prévia dos itens. */
export function CartDropdown() {
  const { items, totals, isEmpty } = useCart();
  return (
    <Popover
      triggerLabel={`Carrinho (${totals.count} itens)`}
      trigger={
        <>
          <ShoppingCart className="size-5" />
          {totals.count > 0 && (
            <span
              data-testid="cart-count"
              className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
            >
              {totals.count}
            </span>
          )}
        </>
      }
    >
      {(close) =>
        isEmpty ? (
          <p className="text-sm text-muted-foreground">Seu carrinho está vazio.</p>
        ) : (
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2 text-sm">
              {items.slice(0, PREVIEW_ITEMS).map((item) => (
                <li key={item.produtoId} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.quantidade}× {item.nome}
                  </span>
                  <span className="shrink-0">{formatCurrency(lineTotal(item))}</span>
                </li>
              ))}
            </ul>
            {items.length > PREVIEW_ITEMS && (
              <p className="text-xs text-muted-foreground">
                e mais {items.length - PREVIEW_ITEMS} produto(s)
              </p>
            )}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <Link href={ROUTES.carrinho} onClick={close} className={buttonVariants()}>
              Ver carrinho
            </Link>
          </div>
        )
      }
    </Popover>
  );
}
