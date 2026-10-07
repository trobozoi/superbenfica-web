"use client";

import { MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AddressForm } from "@/components/checkout/AddressForm";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, ErrorMessage, Skeleton } from "@/components/ui/Feedback";
import { toApiError } from "@/lib/api/errors";
import { useAddAddress, useAddresses, useDeleteAddress, useProfile } from "@/lib/hooks/useProfile";
import type { EnderecoValues } from "@/lib/utils/validation";
import { enderecoSchema } from "@/lib/utils/validation";

export function ProfileView() {
  const profile = useProfile();
  const addresses = useAddresses();
  const addAddress = useAddAddress();
  const deleteAddress = useDeleteAddress();

  if (profile.error) return <ErrorMessage message={toApiError(profile.error).message} />;
  if (profile.isPending) return <Skeleton className="h-64" />;
  const cliente = profile.data;
  if (!cliente) return <ErrorMessage message="Cadastro de cliente não encontrado." />;

  const handleAdd = async (values: EnderecoValues) => {
    const parsed = enderecoSchema.parse(values);
    await addAddress.mutateAsync({ ...parsed, cliente: cliente.id });
    toast.success("Endereço salvo.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Nome</dt>
              <dd className="font-medium">{cliente.nome}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">E-mail</dt>
              <dd className="font-medium break-all">{cliente.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Telefone</dt>
              <dd className="font-medium">{cliente.telefone || "-"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereços</CardTitle>
          <CardDescription>
            Usados para entrega quando a loja oferecer esse serviço.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {addresses.isPending ? (
            <Skeleton className="h-20" />
          ) : (
            <ul className="flex flex-col gap-3">
              {addresses.data?.length === 0 && (
                <li className="text-sm text-muted-foreground">Nenhum endereço cadastrado.</li>
              )}
              {addresses.data?.map((endereco) => (
                <li
                  key={endereco.id}
                  className="flex items-start gap-3 rounded-md border p-3 text-sm"
                >
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <p className="font-medium">
                      {endereco.endereco}, {endereco.numero}
                      {endereco.complemento && ` - ${endereco.complemento}`}{" "}
                      {endereco.principal && <Badge tone="info">Principal</Badge>}
                    </p>
                    <p className="text-muted-foreground">
                      {endereco.bairro}, {endereco.cidade}/{endereco.estado} · CEP {endereco.cep}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir endereço ${endereco.endereco}, ${endereco.numero}`}
                    onClick={() => deleteAddress.mutate(endereco.id)}
                    disabled={deleteAddress.isPending}
                  >
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t pt-5">
            <h3 className="mb-4 font-medium">Novo endereço</h3>
            <AddressForm onSubmit={handleAdd} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
