"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Input";
import { toApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/utils/constants";
import { formatTelefone } from "@/lib/utils/format";
import { registerSchema, type RegisterValues } from "@/lib/utils/validation";

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: "", email: "", telefone: "", password: "", confirmPassword: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit((values) => {
    register.mutate(
      {
        nome: values.nome,
        email: values.email,
        telefone: values.telefone,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.replace(ROUTES.produtos);
          router.refresh();
        },
        onError: (error) => {
          // Erros por campo da API (ex.: e-mail já cadastrado, senha fraca).
          const apiError = toApiError(error);
          for (const [field, message] of Object.entries(apiError.fieldErrors)) {
            if (field in values) form.setError(field as keyof RegisterValues, { message });
          }
        },
      },
    );
  });
  const apiError = register.error ? toApiError(register.error) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {apiError && Object.keys(apiError.fieldErrors).length === 0 && (
        <ErrorMessage message={apiError.message} />
      )}
      <Field label="Nome completo" error={errors.nome?.message}>
        {(aria) => <Input {...aria} autoComplete="name" {...form.register("nome")} />}
      </Field>
      <Field label="E-mail" error={errors.email?.message}>
        {(aria) => (
          <Input {...aria} type="email" autoComplete="email" {...form.register("email")} />
        )}
      </Field>
      <Field label="Celular (opcional)" error={errors.telefone?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(85) 99999-9999"
            {...form.register("telefone", {
              onChange: (event) => form.setValue("telefone", formatTelefone(event.target.value)),
            })}
          />
        )}
      </Field>
      <Field
        label="Senha"
        hint="Mínimo de 8 caracteres, não apenas números."
        error={errors.password?.message}
      >
        {(aria) => (
          <Input
            {...aria}
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
        )}
      </Field>
      <Field label="Confirme a senha" error={errors.confirmPassword?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
        )}
      </Field>
      <p className="text-xs text-muted-foreground">
        Ao criar a conta você concorda com o uso dos seus dados para processar pedidos, conforme a
        LGPD.
      </p>
      <Button type="submit" size="lg" loading={register.isPending}>
        Criar conta
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href={ROUTES.login} className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
