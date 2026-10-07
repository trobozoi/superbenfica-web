import { Check } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Feedback";
import { pedidoStatusLabel } from "@/lib/utils/constants";
import { cn } from "@/lib/utils/cn";
import type { PedidoStatus, TipoEntrega } from "@/types/entities";

const TONES: Record<PedidoStatus, BadgeTone> = {
  PENDENTE: "warning",
  EM_SEPARACAO: "info",
  SEPARADO: "success",
  SAIU_PARA_ENTREGA: "info",
  FINALIZADO: "neutral",
  CANCELADO: "danger",
};

interface OrderStatusProps {
  status: PedidoStatus;
  tipoEntrega: TipoEntrega;
}

export function OrderStatusBadge({ status, tipoEntrega }: Readonly<OrderStatusProps>) {
  return <Badge tone={TONES[status]}>{pedidoStatusLabel(status, tipoEntrega)}</Badge>;
}

/** Só a entrega em domicílio passa por "Saiu para entrega". */
const FLOW: Record<TipoEntrega, PedidoStatus[]> = {
  RETIRADA: ["PENDENTE", "EM_SEPARACAO", "SEPARADO", "FINALIZADO"],
  DOMICILIO: ["PENDENTE", "EM_SEPARACAO", "SEPARADO", "SAIU_PARA_ENTREGA", "FINALIZADO"],
};

/** Linha do tempo do pedido (rastreamento). Atualiza sozinha via WebSocket. */
export function OrderTimeline({ status, tipoEntrega }: Readonly<OrderStatusProps>) {
  if (status === "CANCELADO") {
    return <p className="text-sm text-destructive">Este pedido foi cancelado.</p>;
  }
  const flow = FLOW[tipoEntrega];
  const current = flow.indexOf(status);
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:gap-0" aria-label="Andamento do pedido">
      {flow.map((step, index) => {
        const done = index <= current;
        return (
          <li key={step} className="flex flex-1 items-center gap-2 sm:flex-col sm:text-center">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={cn("text-sm", done ? "font-medium" : "text-muted-foreground")}>
              {pedidoStatusLabel(step, tipoEntrega)}
              {index === current && <span className="sr-only"> (etapa atual)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
