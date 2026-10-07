import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  enderecoSchema,
  loginSchema,
  registerSchema,
  safeRedirectPath,
} from "@/lib/utils/validation";

describe("validation", () => {
  it("valida login", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "invalido", password: "" }).success).toBe(false);
  });

  it("exige senhas iguais e não só numéricas no cadastro", () => {
    const base = {
      nome: "Ana",
      email: "ana@x.com",
      password: "segura123",
      confirmPassword: "segura123",
    };
    expect(registerSchema.safeParse(base).success).toBe(true);

    const different = registerSchema.safeParse({ ...base, confirmPassword: "outra123" });
    expect(different.success).toBe(false);
    expect(different.error?.issues[0]?.path).toEqual(["confirmPassword"]);

    const numeric = registerSchema.safeParse({
      ...base,
      password: "12345678",
      confirmPassword: "12345678",
    });
    expect(numeric.success).toBe(false);
  });

  it("valida endereço (CEP com 8 dígitos e UF válida)", () => {
    const endereco = {
      cep: "60000-000",
      endereco: "Rua Benfica",
      numero: "1000",
      bairro: "Centro",
      cidade: "Fortaleza",
      estado: "CE",
    };
    expect(enderecoSchema.safeParse(endereco).success).toBe(true);
    expect(enderecoSchema.safeParse({ ...endereco, cep: "123" }).success).toBe(false);
    expect(enderecoSchema.safeParse({ ...endereco, estado: "XX" }).success).toBe(false);
  });

  it("exige loja e forma de pagamento no checkout", () => {
    expect(checkoutSchema.safeParse({ loja: 1, formaPagamento: 2 }).success).toBe(true);
    expect(checkoutSchema.safeParse({ loja: 0, formaPagamento: 2 }).success).toBe(false);
    expect(checkoutSchema.safeParse({ loja: 1, formaPagamento: 0 }).success).toBe(false);
  });

  it("exige endereço só na entrega em domicílio", () => {
    const base = { loja: 1, formaPagamento: 2 };
    expect(checkoutSchema.parse(base).tipoEntrega).toBe("RETIRADA");
    expect(checkoutSchema.safeParse({ ...base, tipoEntrega: "RETIRADA" }).success).toBe(true);
    const semEndereco = checkoutSchema.safeParse({ ...base, tipoEntrega: "DOMICILIO" });
    expect(semEndereco.success).toBe(false);
    expect(semEndereco.error?.issues[0]?.path).toEqual(["endereco"]);
    expect(
      checkoutSchema.safeParse({ ...base, tipoEntrega: "DOMICILIO", endereco: 7 }).success,
    ).toBe(true);
    expect(checkoutSchema.safeParse({ ...base, tipoEntrega: "DRONE" }).success).toBe(false);
  });

  it("aceita só redirecionamentos internos (evita open redirect)", () => {
    expect(safeRedirectPath("/pedidos/3")).toBe("/pedidos/3");
    expect(safeRedirectPath("https://malicioso.com")).toBe("/produtos");
    expect(safeRedirectPath("//malicioso.com")).toBe("/produtos");
    expect(safeRedirectPath("/\\malicioso.com")).toBe("/produtos");
    expect(safeRedirectPath(null, "/")).toBe("/");
  });
});
