"use client";

import { ChevronRight, ClipboardList } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/Feedback";
import { Pagination } from "@/components/ui/Pagination";
import { toApiError } from "@/lib/api/errors";
import { useOrders } from "@/lib/hooks/useOrders";
import { ROUTES } from "@/lib/utils/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { OrderStatusBadge } from "./OrderStatus";

export function OrderHistory() {
  const [page, setPage] = useState(1);
  const { data, isPending, error } = useOrders(page);

  if (error) return <ErrorMessage message={toApiError(error).message} />;
  if (isPending) return <Skeleton className="h-48" />;
  if (data.results.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList />}
        title="Você ainda não fez pedidos"
        description="Monte seu carrinho e retire na loja mais perto de você."
        action={
          <Link href={ROUTES.produtos} className={buttonVariants()}>
            Ver produtos
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-y rounded-xl border bg-card">
        {data.results.map((pedido) => (
          <li key={pedido.id}>
            <Link
              href={ROUTES.pedido(pedido.id)}
              className="flex items-center gap-4 p-4 transition-colors hover:bg-accent"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{pedido.codigo}</span>
                  <OrderStatusBadge status={pedido.status} tipoEntrega={pedido.tipo_entrega} />
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDateTime(pedido.data_criacao)} · {pedido.loja_nome} · {pedido.itens.length}{" "}
                  {pedido.itens.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <span className="font-semibold">{formatCurrency(pedido.total)}</span>
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination page={page} count={data.count} onPageChange={setPage} />
    </div>
  );
}
