import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_PAGE_SIZE } from "@/lib/utils/constants";
import { Button } from "./Button";

interface PaginationProps {
  page: number;
  count: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, count, onPageChange }: Readonly<PaginationProps>) {
  const totalPages = Math.max(1, Math.ceil(count / API_PAGE_SIZE));
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft /> Anterior
      </Button>
      <span className="text-sm text-muted-foreground" aria-live="polite">
        Página {page} de {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Próxima <ChevronRight />
      </Button>
    </nav>
  );
}
