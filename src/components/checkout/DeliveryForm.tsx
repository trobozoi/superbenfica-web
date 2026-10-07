import { Store, Truck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/Feedback";
import { cn } from "@/lib/utils/cn";
import { ROUTES } from "@/lib/utils/constants";
import type { EnderecoCliente, TipoEntrega } from "@/types/entities";

const OPCOES: { tipo: TipoEntrega; titulo: string; descricao: string; icone: ReactNode }[] = [
  {
    tipo: "RETIRADA",
    titulo: "Retirar na loja",
    descricao: "Você busca o pedido na loja escolhida.",
    icone: <Store />,
  },
  {
    tipo: "DOMICILIO",
    titulo: "Entrega em domicílio",
    descricao: "A loja leva o pedido até o seu endereço.",
    icone: <Truck />,
  },
];

const cardClass = (selected: boolean) =>
  cn(
    "flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition-colors has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/50 [&_svg]:size-5 [&_svg]:shrink-0",
    selected ? "border-primary bg-primary/5" : "hover:bg-accent",
  );

interface DeliveryFormProps {
  tipo: TipoEntrega;
  onTipoChange: (tipo: TipoEntrega) => void;
  enderecos: EnderecoCliente[] | undefined;
  endereco: number | undefined;
  onEnderecoChange: (id: number) => void;
  error?: string;
}

/** Escolha entre retirar na loja ou receber em casa (com um dos endereços do perfil). */
export function DeliveryForm({
  tipo,
  onTipoChange,
  enderecos,
  endereco,
  onEnderecoChange,
  error,
}: Readonly<DeliveryFormProps>) {
  const errorId = "endereco-erro";
  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Forma de entrega</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {OPCOES.map((opcao) => (
            <label key={opcao.tipo} className={cardClass(tipo === opcao.tipo)}>
              <input
                type="radio"
                name="tipo_entrega"
                value={opcao.tipo}
                checked={tipo === opcao.tipo}
                onChange={() => onTipoChange(opcao.tipo)}
                className="sr-only"
              />
              <span aria-hidden="true">{opcao.icone}</span>
              <span>
                <span className="block font-medium">{opcao.titulo}</span>
                <span className="block text-xs text-muted-foreground">{opcao.descricao}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {tipo === "DOMICILIO" && (
        <fieldset aria-describedby={error ? errorId : undefined} className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Endereço de entrega</legend>
          {enderecos === undefined && <Skeleton className="h-20" />}
          {enderecos?.length === 0 && (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              Você ainda não tem endereço cadastrado.{" "}
              <Link href={ROUTES.perfil} className="font-medium text-primary underline">
                Cadastre um no seu perfil
              </Link>{" "}
              e volte para finalizar o pedido.
            </p>
          )}
          {enderecos?.map((item) => (
            <label
              key={item.id}
              className={cn(cardClass(endereco === item.id), "flex-col gap-0.5")}
            >
              <input
                type="radio"
                name="endereco"
                value={item.id}
                checked={endereco === item.id}
                onChange={() => onEnderecoChange(item.id)}
                className="sr-only"
              />
              <span className="font-medium">
                {item.endereco}, {item.numero}
                {item.complemento && ` (${item.complemento})`}
                {item.principal && " · Principal"}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.bairro}, {item.cidade}/{item.estado} · CEP {item.cep}
              </span>
            </label>
          ))}
          {error && (
            <p id={errorId} role="alert" className="text-xs text-destructive">
              {error}
            </p>
          )}
        </fieldset>
      )}
    </div>
  );
}
