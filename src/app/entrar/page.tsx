import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-2xl">Entrar</span>
          </CardTitle>
          <CardDescription>Acesse sua conta para fazer pedidos.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* useSearchParams (?next=, ?expired=) exige Suspense na renderização estática. */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
