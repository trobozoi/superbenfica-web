import { Clock, ShoppingBag, Store, Zap } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { getServerSession } from "@/lib/server/session";
import { ROUTES } from "@/lib/utils/constants";

const BENEFITS = [
  {
    icon: ShoppingBag,
    title: "Sem instalar nada",
    text: "Compre direto do navegador, no computador ou no celular.",
  },
  {
    icon: Store,
    title: "Retire na loja",
    text: "Escolha a filial mais perto e retire quando o pedido estiver pronto.",
  },
  {
    icon: Zap,
    title: "Status em tempo real",
    text: "Acompanhe cada etapa do pedido, da separação à retirada.",
  },
  {
    icon: Clock,
    title: "Mesmo catálogo do app",
    text: "Preços e produtos sincronizados com o aplicativo e as lojas.",
  },
] as const;

export default async function HomePage() {
  const user = await getServerSession();
  const primaryHref = user ? ROUTES.produtos : ROUTES.register;

  return (
    <div className="flex flex-col gap-12 py-6">
      <section className="flex flex-col items-start gap-6 rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-10">
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          Seu supermercado, a um clique de distância.
        </h1>
        <p className="max-w-xl text-lg opacity-90">
          Monte seu carrinho no Super Benfica Web e retire na loja sem filas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={primaryHref} className={buttonVariants({ size: "lg", variant: "secondary" })}>
            {user ? "Ver produtos" : "Criar conta grátis"}
          </Link>
          {!user && (
            <Link
              href={ROUTES.login}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              })}
            >
              Já tenho conta
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="beneficios">
        <h2 id="beneficios" className="sr-only">
          Benefícios
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <Icon className="size-6 text-primary" aria-hidden="true" />
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
