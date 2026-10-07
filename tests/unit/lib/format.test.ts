import { describe, expect, it } from "vitest";
import {
  formatCep,
  formatCurrency,
  formatDateTime,
  formatTelefone,
  formatTime,
  onlyDigits,
  toNumber,
} from "@/lib/utils/format";

// Intl usa espaço não separável entre "R$" e o valor.
const normalize = (value: string) => value.replaceAll(" ", " ");

describe("format", () => {
  it("converte decimais da API (string) em número", () => {
    expect(toNumber("12.90")).toBeCloseTo(12.9);
    expect(toNumber(3)).toBe(3);
    expect(toNumber("abc")).toBe(0);
    expect(toNumber(null)).toBe(0);
  });

  it("formata moeda em reais", () => {
    expect(normalize(formatCurrency("1234.5"))).toBe("R$ 1.234,50");
    expect(normalize(formatCurrency(undefined))).toBe("R$ 0,00");
  });

  it("formata data/hora e trata valores inválidos", () => {
    expect(formatDateTime("2026-10-03T14:30:00-03:00")).toMatch(/03\/10\/2026/);
    expect(formatDateTime("invalida")).toBe("-");
    expect(formatDateTime(null)).toBe("-");
  });

  it("formata horário da loja", () => {
    expect(formatTime("07:00:00")).toBe("07:00");
    expect(formatTime(undefined)).toBe("-");
  });

  it("extrai dígitos", () => {
    expect(onlyDigits("(85) 9-91")).toBe("85991");
  });

  it("aplica máscara de CEP", () => {
    expect(formatCep("60000000")).toBe("60000-000");
    expect(formatCep("600")).toBe("600");
    expect(formatCep("60000-0001234")).toBe("60000-000");
  });

  it("aplica máscara de telefone fixo e celular", () => {
    expect(formatTelefone("85")).toBe("85");
    expect(formatTelefone("85320")).toBe("(85) 320");
    expect(formatTelefone("8532001000")).toBe("(85) 3200-1000");
    expect(formatTelefone("85991000005")).toBe("(85) 99100-0005");
  });
});
