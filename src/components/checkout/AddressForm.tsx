"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/Feedback";
import { Field, Input, Select } from "@/components/ui/Input";
import { toApiError } from "@/lib/api/errors";
import { buscarCep, CepLookupError } from "@/lib/services/cep.service";
import { formatCep, onlyDigits } from "@/lib/utils/format";
import { enderecoSchema, type EnderecoValues } from "@/lib/utils/validation";
import { UFS } from "@/types/entities";

interface AddressFormProps {
  onSubmit: (values: EnderecoValues) => Promise<unknown>;
  submitLabel?: string;
}

/** Cadastro de endereço de entrega (POST /api/enderecos/). */
export function AddressForm({
  onSubmit,
  submitLabel = "Salvar endereço",
}: Readonly<AddressFormProps>) {
  const form = useForm<EnderecoValues>({
    resolver: zodResolver(enderecoSchema),
    defaultValues: {
      cep: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "CE",
      principal: false,
    },
  });
  const { errors, isSubmitting } = form.formState;
  const [buscandoCep, setBuscandoCep] = useState(false);
  const cepRequest = useRef<AbortController | null>(null);

  useEffect(() => () => cepRequest.current?.abort(), []);

  /** Preenche logradouro, bairro, cidade e UF pelo ViaCEP quando o CEP fica completo. */
  async function preencherPorCep(cep: string) {
    cepRequest.current?.abort();
    if (onlyDigits(cep).length !== 8) {
      setBuscandoCep(false);
      return;
    }
    const controller = new AbortController();
    cepRequest.current = controller;
    setBuscandoCep(true);
    try {
      const endereco = await buscarCep(cep, controller.signal);
      if (controller.signal.aborted) return;
      if (!endereco) {
        form.setError("cep", { message: "CEP não encontrado." });
        return;
      }
      const options = { shouldValidate: true, shouldDirty: true } as const;
      form.clearErrors("cep");
      form.setValue("endereco", endereco.endereco, options);
      form.setValue("bairro", endereco.bairro, options);
      form.setValue("cidade", endereco.cidade, options);
      if (endereco.estado) form.setValue("estado", endereco.estado, options);
      if (endereco.complemento && !form.getValues("complemento")) {
        form.setValue("complemento", endereco.complemento, options);
      }
      form.setFocus(endereco.endereco ? "numero" : "endereco");
    } catch (error) {
      if (error instanceof CepLookupError) form.setError("cep", { message: error.message });
    } finally {
      if (cepRequest.current === controller) setBuscandoCep(false);
    }
  }

  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      const apiError = toApiError(error);
      for (const [field, message] of Object.entries(apiError.fieldErrors)) {
        form.setError(field as keyof EnderecoValues, { message });
      }
      form.setError("root", { message: apiError.message });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-6">
      {errors.root?.message && (
        <div className="sm:col-span-6">
          <ErrorMessage message={errors.root.message} />
        </div>
      )}
      <Field
        label="CEP"
        error={errors.cep?.message}
        hint={buscandoCep ? "Buscando endereço..." : undefined}
        className="sm:col-span-2"
      >
        {(aria) => (
          <Input
            {...aria}
            inputMode="numeric"
            autoComplete="postal-code"
            {...form.register("cep", {
              onChange: (event) => {
                const cep = formatCep(event.target.value);
                form.setValue("cep", cep);
                // Um 9º dígito é descartado pela máscara: o CEP não mudou, não consulta de novo.
                if (onlyDigits(event.target.value).length <= 8) void preencherPorCep(cep);
              },
            })}
          />
        )}
      </Field>
      <Field label="Logradouro" error={errors.endereco?.message} className="sm:col-span-4">
        {(aria) => <Input {...aria} autoComplete="address-line1" {...form.register("endereco")} />}
      </Field>
      <Field label="Número" error={errors.numero?.message} className="sm:col-span-2">
        {(aria) => <Input {...aria} {...form.register("numero")} />}
      </Field>
      <Field label="Complemento" error={errors.complemento?.message} className="sm:col-span-4">
        {(aria) => (
          <Input {...aria} autoComplete="address-line2" {...form.register("complemento")} />
        )}
      </Field>
      <Field label="Bairro" error={errors.bairro?.message} className="sm:col-span-2">
        {(aria) => <Input {...aria} {...form.register("bairro")} />}
      </Field>
      <Field label="Cidade" error={errors.cidade?.message} className="sm:col-span-3">
        {(aria) => <Input {...aria} autoComplete="address-level2" {...form.register("cidade")} />}
      </Field>
      <Field label="UF" error={errors.estado?.message} className="sm:col-span-1">
        {(aria) => (
          <Select {...aria} autoComplete="address-level1" {...form.register("estado")}>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-6">
        <input type="checkbox" className="size-4 accent-primary" {...form.register("principal")} />
        Usar como endereço principal
      </label>
      <div className="sm:col-span-6">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
