import { Banknote, CreditCard, QrCode, Ticket } from "lucide-react";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils/cn";
import type { FormaPagamento, TipoPagamento } from "@/types/entities";

const ICONS: Record<TipoPagamento, ReactNode> = {
  PIX: <QrCode />,
  CREDITO: <CreditCard />,
  DEBITO: <CreditCard />,
  DINHEIRO: <Banknote />,
  VALE_ALIMENTACAO: <Ticket />,
};

interface PaymentFormProps {
  formas: FormaPagamento[] | undefined;
  value: number | undefined;
  onChange: (id: number) => void;
  error?: string;
  /** Quando o pagamento acontece: "na retirada" ou "na entrega". */
  momento?: string;
}

/**
 * Escolha da forma de pagamento (cadastradas pelo ADMIN na API).
 * A API ainda não integra gateway: o pagamento é feito na retirada ou na entrega. Quando houver
 * gateway (Stripe, PagSeguro...), os dados de cartão devem ir direto para o SDK dele,
 * nunca passar por este frontend nem pela nossa API (escopo PCI-DSS).
 */
export function PaymentForm({
  formas,
  value,
  onChange,
  error,
  momento = "na retirada",
}: Readonly<PaymentFormProps>) {
  const errorId = "pagamento-erro";
  return (
    <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">Forma de pagamento ({momento})</legend>
      {formas === undefined ? (
        <Skeleton className="h-24" />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {formas.map((forma) => (
            <label
              key={forma.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 [&_svg]:size-5",
                value === forma.id ? "border-primary bg-primary/5" : "hover:bg-accent",
              )}
            >
              <input
                type="radio"
                name="forma_pagamento"
                value={forma.id}
                checked={value === forma.id}
                onChange={() => onChange(forma.id)}
                className="sr-only"
              />
              <span aria-hidden="true">{ICONS[forma.tipo]}</span>
              <span>{forma.nome}</span>
            </label>
          ))}
        </div>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
