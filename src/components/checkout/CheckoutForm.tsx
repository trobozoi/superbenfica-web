"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { CartSummary } from "@/components/cart/CartSummary";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState, ErrorMessage } from "@/components/ui/Feedback";
import { Field, Select, Textarea } from "@/components/ui/Input";
import { toApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCart } from "@/lib/hooks/useCart";
import { useAddresses } from "@/lib/hooks/useProfile";
import { useFormasPagamento, useLojas } from "@/lib/hooks/useCatalog";
import { useCreateOrder } from "@/lib/hooks/useOrders";
import { toOrderPayload } from "@/lib/services/cart.service";
import { ROUTES } from "@/lib/utils/constants";
import { formatTime } from "@/lib/utils/format";
import { checkoutSchema, type CheckoutValues } from "@/lib/utils/validation";
import type { TipoEntrega } from "@/types/entities";
import { DeliveryForm } from "./DeliveryForm";
import { PaymentForm } from "./PaymentForm";

/** Mensagens de negócio da API que merecem destaque (409 = estoque/indisponível). */
function orderErrorMessage(status: number, message: string): string {
  if (status === 409) return `${message} Ajuste o carrinho e tente novamente.`;
  return message;
}

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totals, clear } = useCart();
  const lojas = useLojas();
  const formas = useFormasPagamento();
  const enderecos = useAddresses();
  const createOrder = useCreateOrder();

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      loja: user?.lojaId ?? 0,
      formaPagamento: 0,
      tipoEntrega: "RETIRADA",
      endereco: undefined,
      observacao: "",
    },
  });
  const apiError = createOrder.error ? toApiError(createOrder.error) : null;

  const onSubmit = form.handleSubmit((values) => {
    const payload = toOrderPayload(items, {
      loja: values.loja,
      formaPagamento: values.formaPagamento,
      observacao: values.observacao,
      tipoEntrega: values.tipoEntrega,
      endereco: values.endereco,
    });
    createOrder.mutate(payload, {
      onSuccess: (pedido) => {
        clear();
        toast.success(`Pedido ${pedido.codigo} registrado!`);
        router.push(ROUTES.pedido(pedido.id));
      },
    });
  });

  const lojaId = useWatch({ control: form.control, name: "loja" });
  const selectedLoja = lojas.data?.find((loja) => loja.id === lojaId);
  const tipoEntrega = useWatch({ control: form.control, name: "tipoEntrega" }) ?? "RETIRADA";
  const domicilio = tipoEntrega === "DOMICILIO";

  /** Ao escolher entrega em domicílio, já sugere o endereço principal (ou o primeiro). */
  const changeTipoEntrega = (tipo: TipoEntrega) => {
    form.setValue("tipoEntrega", tipo);
    const lista = enderecos.data ?? [];
    if (tipo === "DOMICILIO" && !form.getValues("endereco") && lista.length > 0) {
      const sugerido = lista.find((item) => item.principal) ?? lista[0];
      form.setValue("endereco", sugerido?.id);
    }
    form.clearErrors("endereco");
  };

  if (items.length === 0 && !createOrder.isSuccess) {
    return (
      <EmptyState
        title="Seu carrinho está vazio"
        description="Adicione produtos antes de finalizar o pedido."
        action={
          <Link href={ROUTES.produtos} className={buttonVariants()}>
            Ver produtos
          </Link>
        }
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Dados do pedido</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {apiError && (
            <ErrorMessage message={orderErrorMessage(apiError.status, apiError.message)} />
          )}

          <Controller
            control={form.control}
            name="endereco"
            render={({ field, fieldState }) => (
              <DeliveryForm
                tipo={tipoEntrega}
                onTipoChange={changeTipoEntrega}
                enderecos={enderecos.data}
                endereco={field.value}
                onEnderecoChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Field
            label={domicilio ? "Loja que fará a entrega" : "Loja para retirada"}
            error={form.formState.errors.loja?.message}
          >
            {(aria) => (
              <Select {...aria} {...form.register("loja", { valueAsNumber: true })}>
                <option value={0}>Selecione a loja</option>
                {lojas.data?.map((loja) => (
                  <option key={loja.id} value={loja.id}>
                    {loja.nome}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          {selectedLoja && (
            <p className="-mt-3 text-sm text-muted-foreground">
              {selectedLoja.endereco} · {formatTime(selectedLoja.horario_abertura)} às{" "}
              {formatTime(selectedLoja.horario_fechamento)}
            </p>
          )}

          <Controller
            control={form.control}
            name="formaPagamento"
            render={({ field, fieldState }) => (
              <PaymentForm
                momento={domicilio ? "na entrega" : "na retirada"}
                formas={formas.data}
                value={field.value || undefined}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Field
            label="Observações (opcional)"
            hint="Ex.: sem sacolas, preferência de marca."
            error={form.formState.errors.observacao?.message}
          >
            {(aria) => <Textarea {...aria} maxLength={500} {...form.register("observacao")} />}
          </Field>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <CartSummary
          totals={totals}
          entrega={domicilio ? "Em domicílio, sem taxa" : "Retirada na loja"}
          action={
            <Button
              type="submit"
              size="lg"
              loading={createOrder.isPending}
              disabled={items.length === 0}
            >
              Confirmar pedido
            </Button>
          }
        />
      </div>
    </form>
  );
}
