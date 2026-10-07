"use client";

import { ArrowLeft, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState, ErrorMessage, Skeleton } from "@/components/ui/Feedback";
import { Modal } from "@/components/ui/Modal";
import { toApiError } from "@/lib/api/errors";
import { useCancelOrder, useOrder } from "@/lib/hooks/useOrders";
import { ROUTES } from "@/lib/utils/constants";
import { formatCurrency, formatDateTime } from "@/lib/utils/format";
import { useCartStore } from "@/stores/cartStore";
import type { Pedido } from "@/types/entities";
import { OrderStatusBadge, OrderTimeline } from "./OrderStatus";

/** "Repedido rápido": coloca os itens de um pedido antigo de volta no carrinho. */
function reorder(pedido: Pedido): void {
  const { add } = useCartStore.getState();
  for (const item of pedido.itens) {
    add(
      { id: item.produto, nome: item.produto_nome, preco: item.preco_unitario, foto: null },
      item.quantidade,
    );
  }
}

export function OrderDetail({ id }: Readonly<{ id: number }>) {
  const router = useRouter();
  const { data: pedido, isPending, error } = useOrder(id);
  const cancel = useCancelOrder();
  const [confirming, setConfirming] = useState(false);

  if (error) {
    const apiError = toApiError(error);
    return apiError.status === 404 ? (
      <EmptyState title="Pedido não encontrado" />
    ) : (
      <ErrorMessage message={apiError.message} />
    );
  }
  if (isPending) return <Skeleton className="h-96" />;
  const domicilio = pedido.tipo_entrega === "DOMICILIO";

  const handleCancel = () => {
    cancel.mutate(pedido.id, {
      onSuccess: () => {
        setConfirming(false);
        toast.success(`Pedido ${pedido.codigo} cancelado.`);
      },
      onError: (cancelError) => {
        setConfirming(false);
        toast.error(toApiError(cancelError).message);
      },
    });
  };

  const handleReorder = () => {
    reorder(pedido);
    toast.success("Itens adicionados ao carrinho. Os preços serão atualizados.");
    router.push(ROUTES.carrinho);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={ROUTES.pedidos}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Meus pedidos
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
            Pedido {pedido.codigo}{" "}
            <OrderStatusBadge status={pedido.status} tipoEntrega={pedido.tipo_entrega} />
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDateTime(pedido.data_criacao)} ·{" "}
            {domicilio
              ? `Entrega em domicílio por ${pedido.loja_nome}`
              : `Retirada em ${pedido.loja_nome}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReorder}>
            <RotateCcw /> Pedir novamente
          </Button>
          {pedido.status === "PENDENTE" && (
            <Button variant="destructive" onClick={() => setConfirming(true)}>
              Cancelar pedido
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-5">
          <OrderTimeline status={pedido.status} tipoEntrega={pedido.tipo_entrega} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Itens</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {pedido.itens.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 text-sm">
                <span>
                  {item.quantidade}× {item.produto_nome}
                  <span className="block text-xs text-muted-foreground">
                    {formatCurrency(item.preco_unitario)} / un.
                  </span>
                </span>
                <span className="font-medium">{formatCurrency(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 flex flex-col gap-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">
                Pagamento ({domicilio ? "na entrega" : "na retirada"})
              </dt>
              <dd>{pedido.forma_pagamento_nome || "-"}</dd>
            </div>
            {domicilio && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Endereço de entrega</dt>
                <dd className="text-right">{pedido.endereco_entrega}</dd>
              </div>
            )}
            {pedido.observacao && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Observações</dt>
                <dd className="text-right">{pedido.observacao}</dd>
              </div>
            )}
            <div className="flex justify-between text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatCurrency(pedido.total)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancelar pedido?"
        description={`O pedido ${pedido.codigo} será cancelado e os itens voltam ao estoque da loja.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Manter pedido
            </Button>
            <Button variant="destructive" onClick={handleCancel} loading={cancel.isPending}>
              Sim, cancelar
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}
