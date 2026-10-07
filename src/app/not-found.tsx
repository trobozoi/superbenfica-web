import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Feedback";
import { ROUTES } from "@/lib/utils/constants";

export default function NotFound() {
  return (
    <EmptyState
      title="Página não encontrada"
      description="O endereço pode estar errado ou a página foi removida."
      action={
        <Link href={ROUTES.home} className={buttonVariants()}>
          Voltar ao início
        </Link>
      }
    />
  );
}
