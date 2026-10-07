import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { NETWORK_ERROR_STATUS, parseDrfErrorBody, toApiError } from "@/lib/api/errors";

function axiosError(status: number | null, data?: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response =
    status === null ? undefined : { status, data, statusText: "", headers: {}, config };
  return new AxiosError("falha", "ERR", config, null, response);
}

describe("errors", () => {
  it("lê detail do DRF", () => {
    expect(parseDrfErrorBody(409, { detail: "Estoque insuficiente." }).message).toBe(
      "Estoque insuficiente.",
    );
  });

  it("separa erros por campo e usa o primeiro como mensagem", () => {
    const error = parseDrfErrorBody(400, { email: ["Já cadastrado."], code: "x" });
    expect(error.fieldErrors).toEqual({ email: "Já cadastrado." });
    expect(error.message).toBe("Já cadastrado.");
  });

  it("aceita non_field_errors, listas, objetos aninhados e texto", () => {
    expect(parseDrfErrorBody(400, { non_field_errors: ["Inválido."] }).message).toBe("Inválido.");
    expect(parseDrfErrorBody(400, ["Erro em lista."]).message).toBe("Erro em lista.");
    expect(parseDrfErrorBody(400, { itens: [{ quantidade: ["Máx 999."] }] }).fieldErrors).toEqual({
      itens: "Máx 999.",
    });
    expect(parseDrfErrorBody(400, "texto simples").message).toBe("texto simples");
  });

  it("ignora HTML de erro e usa mensagem amigável por status", () => {
    expect(parseDrfErrorBody(429, "<html>").message).toMatch(/Muitas tentativas/);
    expect(parseDrfErrorBody(500, null).message).toBe("Não foi possível concluir a operação.");
    expect(parseDrfErrorBody(400, { campo: null }).message).toBe(
      "Não foi possível concluir a operação.",
    );
  });

  it("normaliza erros do axios, de rede e genéricos", () => {
    expect(toApiError(axiosError(404, { detail: "Não encontrado." }))).toEqual({
      status: 404,
      message: "Não encontrado.",
      fieldErrors: {},
    });
    expect(toApiError(axiosError(null)).status).toBe(NETWORK_ERROR_STATUS);
    expect(toApiError(new Error("boom")).message).toBe("boom");
    expect(toApiError("estranho").message).toBe("Não foi possível concluir a operação.");
  });
});
