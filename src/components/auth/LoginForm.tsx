"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/Feedback";
import { Field, Input } from "@/components/ui/Input";
import { toApiError } from "@/lib/api/errors";
import { useAuth } from "@/lib/hooks/useAuth";
import { ROUTES } from "@/lib/utils/constants";
import { loginSchema, safeRedirectPath, type LoginValues } from "@/lib/utils/validation";

/** A API devolve 401 para e-mail ou senha errados; a mensagem é genérica de propósito. */
function loginErrorMessage(status: number, message: string): string {
  return status === 401 ? "E-mail ou senha incorretos." : message;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;
  const apiError = login.error ? toApiError(login.error) : null;

  const onSubmit = form.handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(safeRedirectPath(params.get("next")));
        router.refresh();
      },
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      {params.get("expired") && !apiError && (
        <ErrorMessage message="Sua sessão expirou. Entre novamente." />
      )}
      {apiError && <ErrorMessage message={loginErrorMessage(apiError.status, apiError.message)} />}
      <Field label="E-mail" error={errors.email?.message}>
        {(aria) => (
          <Input {...aria} type="email" autoComplete="email" {...form.register("email")} />
        )}
      </Field>
      <Field label="Senha" error={errors.password?.message}>
        {(aria) => (
          <Input
            {...aria}
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
        )}
      </Field>
      <Button type="submit" size="lg" loading={login.isPending}>
        Entrar
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href={ROUTES.register} className="font-medium text-primary hover:underline">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
