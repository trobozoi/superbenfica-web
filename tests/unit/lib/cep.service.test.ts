import { describe, expect, it, vi } from "vitest";
import { buscarCep, CepLookupError, toCepEndereco } from "@/lib/services/cep.service";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const viaCepCentro = {
  cep: "60060-170",
  logradouro: "Rua São José",
  complemento: "",
  bairro: "Centro",
  localidade: "Fortaleza",
  uf: "CE",
};

describe("cep.service", () => {
  it("consulta o ViaCEP só com os dígitos e mapeia os campos do formulário", async () => {
    const fetchFn = vi.fn().mockResolvedValue(jsonResponse(viaCepCentro));
    await expect(buscarCep("60060-170", undefined, fetchFn)).resolves.toEqual({
      endereco: "Rua São José",
      complemento: "",
      bairro: "Centro",
      cidade: "Fortaleza",
      estado: "CE",
    });
    expect(fetchFn).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/60060170/json/",
      expect.objectContaining({ headers: { Accept: "application/json" } }),
    );
  });

  it("não consulta CEP incompleto", async () => {
    const fetchFn = vi.fn();
    await expect(buscarCep("6006", undefined, fetchFn)).resolves.toBeNull();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("retorna null para CEP inexistente ou com formato recusado", async () => {
    const naoExiste = vi.fn().mockResolvedValue(jsonResponse({ erro: true }));
    await expect(buscarCep("99999999", undefined, naoExiste)).resolves.toBeNull();
    const erroTexto = vi.fn().mockResolvedValue(jsonResponse({ erro: "true" }));
    await expect(buscarCep("99999999", undefined, erroTexto)).resolves.toBeNull();
    const invalido = vi.fn().mockResolvedValue(jsonResponse({}, 400));
    await expect(buscarCep("00000000", undefined, invalido)).resolves.toBeNull();
  });

  it("lança CepLookupError quando o serviço falha", async () => {
    const indisponivel = vi.fn().mockResolvedValue(jsonResponse({}, 503));
    await expect(buscarCep("60060170", undefined, indisponivel)).rejects.toBeInstanceOf(
      CepLookupError,
    );
    const semRede = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(buscarCep("60060170", undefined, semRede)).rejects.toBeInstanceOf(CepLookupError);
  });

  it("repassa o cancelamento sem transformá-lo em erro de consulta", async () => {
    const abort = new DOMException("aborted", "AbortError");
    const fetchFn = vi.fn().mockRejectedValue(abort);
    await expect(buscarCep("60060170", undefined, fetchFn)).rejects.toBe(abort);
  });

  it("ignora UF desconhecida e campos ausentes", () => {
    expect(toCepEndereco({ uf: "XX" })).toEqual({
      endereco: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: null,
    });
  });
});
