import { notFound } from "next/navigation";
import { OrderDetail } from "@/components/orders/OrderDetail";

export default async function OrderPage({ params }: Readonly<{ params: Promise<{ id: string }> }>) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <OrderDetail id={id} />;
}
