import { type ComponentProps, type ReactNode, useId } from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase =
  "w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm shadow-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

export function Input({ className, type = "text", ...props }: Readonly<ComponentProps<"input">>) {
  return <input type={type} className={cn(fieldBase, "h-10 py-1", className)} {...props} />;
}

export function Textarea({ className, ...props }: Readonly<ComponentProps<"textarea">>) {
  return <textarea className={cn(fieldBase, "min-h-20 py-2", className)} {...props} />;
}

/** Select nativo estilizado: acessível por padrão e funciona bem no mobile. */
export function Select({ className, ...props }: Readonly<ComponentProps<"select">>) {
  return <select className={cn(fieldBase, "h-10 py-1 pr-8", className)} {...props} />;
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  /** Recebe id e atributos ARIA para ligar o controle ao rótulo e à mensagem de erro. */
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
  className?: string;
}

/**
 * Rótulo + controle + mensagem de erro, com as ligações de acessibilidade corretas
 * (leitores de tela anunciam o erro ao focar o campo).
 */
export function Field({ label, error, hint, children, className }: Readonly<FieldProps>) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": message ? messageId : undefined,
      })}
      {message && (
        <p
          id={messageId}
          className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}
