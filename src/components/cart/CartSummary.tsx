import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { CartTotals } from "@/lib/services/cart.service";
import { formatCurrency } from "@/lib/utils/format";

interface CartSummaryProps {
  totals: CartTotals;
  /** Botão de ação (ir para o checkout, confirmar pedido...). */
  action?: ReactNode;
  /** Forma de entrega escolhida; no carrinho ainda não foi escolhida. */
  entrega?: string;
}

export function CartSummary({
  totals,
  action,
  entrega = "Retirada ou domicílio, sem taxa",
}: Readonly<CartSummaryProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Itens ({totals.count} {totals.count === 1 ? "unidade" : "unidades"})
            </dt>
            <dd>{formatCurrency(totals.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Entrega</dt>
            <dd className="text-right">{entrega}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-semibold">
            <dt>Total estimado</dt>
            <dd data-testid="cart-total">{formatCurrency(totals.subtotal)}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          O valor final é confirmado pela loja ao registrar o pedido.
        </p>
        {action}
      </CardContent>
    </Card>
  );
}
