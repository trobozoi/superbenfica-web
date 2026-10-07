import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderHistory } from "@/components/orders/OrderHistory";

export const metadata: Metadata = { title: "Meus pedidos" };

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Meus pedidos" description="O status é atualizado em tempo real." />
      <OrderHistory />
    </>
  );
}
