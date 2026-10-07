import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Criar conta" };

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-md py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-2xl">Criar conta</span>
          </CardTitle>
          <CardDescription>Cadastre-se para comprar e retirar na loja.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
