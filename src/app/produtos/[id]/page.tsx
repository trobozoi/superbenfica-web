import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/ProductDetail";

export default async function ProductPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) notFound();
  return <ProductDetail id={id} />;
}
