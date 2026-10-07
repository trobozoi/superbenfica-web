import { z } from "zod";
import { TIPOS_ENTREGA, UFS } from "@/types/entities";
import { onlyDigits } from "./format";

/**
 * Schemas Zod compartilhados entre os formulários (navegador) e os route handlers do BFF
 * (servidor). Validar no cliente melhora a experiência; a validação definitiva é da API.
 */

const email = z.email({ error: "Informe um e-mail válido." }).max(254);
const required = (max: number) =>
  z
    .string()
    .trim()
    .min(1, { error: "Campo obrigatório." })
    .max(max, { error: `Máximo de ${max} caracteres.` });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { error: "Campo obrigatório." }).max(128),
});
export type LoginValues = z.infer<typeof loginSchema>;

/** Senha forte o bastante para passar nos validadores padrão do Django. */
export const passwordSchema = z
  .string()
  .min(8, { error: "Mínimo de 8 caracteres." })
  .max(128)
  .refine((value) => onlyDigits(value).length !== value.length, {
    error: "A senha não pode ser só números.",
  });

export const registerSchema = z
  .object({
    nome: required(150),
    email,
    telefone: z.string().max(20).optional().default(""),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "As senhas não conferem.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.input<typeof registerSchema>;

/** Corpo aceito pela rota /api/auth/register (sem a confirmação de senha). */
export const registerPayloadSchema = z.object({
  nome: required(150),
  email,
  telefone: z.string().max(20).optional().default(""),
  password: passwordSchema,
});

export const enderecoSchema = z.object({
  cep: z
    .string()
    .refine((value) => onlyDigits(value).length === 8, { error: "CEP deve ter 8 dígitos." }),
  endereco: required(255),
  numero: required(20),
  complemento: z.string().max(100).optional().default(""),
  bairro: required(100),
  cidade: required(100),
  estado: z.enum(UFS, { error: "Selecione o estado." }),
  principal: z.boolean().optional().default(false),
});
export type EnderecoValues = z.input<typeof enderecoSchema>;

export const checkoutSchema = z
  .object({
    loja: z.number({ error: "Selecione a loja." }).int().positive({ error: "Selecione a loja." }),
    formaPagamento: z
      .number({ error: "Selecione a forma de pagamento." })
      .int()
      .positive({ error: "Selecione a forma de pagamento." }),
    tipoEntrega: z.enum(TIPOS_ENTREGA).optional().default("RETIRADA"),
    endereco: z.number().int().optional(),
    observacao: z.string().max(500, { error: "Máximo de 500 caracteres." }).optional().default(""),
  })
  .refine((values) => values.tipoEntrega !== "DOMICILIO" || (values.endereco ?? 0) > 0, {
    error: "Selecione o endereço de entrega.",
    path: ["endereco"],
  });
export type CheckoutValues = z.input<typeof checkoutSchema>;

/** Só aceita caminhos internos em ?next= (evita open redirect para outro site). */
export function safeRedirectPath(value: string | null | undefined, fallback = "/produtos"): string {
  if (!value?.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
