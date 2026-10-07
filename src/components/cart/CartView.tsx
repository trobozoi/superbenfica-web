"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/Feedback";
import { useCart } from "@/lib/hooks/useCart";
import { ROUTES } from "@/lib/utils/constants";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

export function CartView() {
  const { items, totals, isEmpty } = useCart();

  if (isEmpty) {
    return (
      <EmptyState
        icon={<ShoppingCart />}
        title="Seu carrinho está vazio"
        description="Adicione produtos do catálogo para continuar."
        action={
          <Link href={ROUTES.produtos} className={buttonVariants()}>
            Ver produtos
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardContent className="pt-1">
          <ul className="divide-y">
            {items.map((item) => (
              <CartItem key={item.produtoId} item={item} />
            ))}
          </ul>
        </CardContent>
      </Card>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummary
          totals={totals}
          action={
            <Link href={ROUTES.checkout} className={buttonVariants({ size: "lg" })}>
              Continuar para o pagamento
            </Link>
          }
        />
      </div>
    </div>
  );
}
