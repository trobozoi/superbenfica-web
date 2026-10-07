import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { CatalogView } from "@/components/products/CatalogView";

export const metadata: Metadata = { title: "Produtos" };

export default function ProductsPage() {
  return (
    <>
      <PageHeader title="Produtos" description="Escolha os itens e retire na loja." />
      <Suspense>
        <CatalogView />
      </Suspense>
    </>
  );
}
