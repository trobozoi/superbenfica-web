import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Finalizar pedido" };

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="Finalizar pedido"
        description="Escolha a forma de entrega, a loja e a forma de pagamento."
      />
      <CheckoutForm />
    </>
  );
}
