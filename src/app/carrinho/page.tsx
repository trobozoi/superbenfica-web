import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Carrinho" };

export default function CartPage() {
  return (
    <>
      <PageHeader title="Carrinho" />
      <CartView />
    </>
  );
}
