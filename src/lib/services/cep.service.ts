import { onlyDigits } from "@/lib/utils/format";
import { UFS, type Uf } from "@/types/entities";

/**
 * Consulta de CEP no ViaCEP (chamada direta do navegador; a origem está liberada
 * no connect-src da CSP em src/proxy.ts).
 */

export const VIACEP_ORIGIN = "https://viacep.com.br";

/** Campos do formulário de endereço que o CEP preenche. */
export interface CepEndereco {
  endereco: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: Uf | null;
}

interface ViaCepResponse {
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  /** O ViaCEP responde 200 com { erro: true } (ou "true") para CEP inexistente. */
  erro?: boolean | string;
}

export class CepLookupError extends Error {
  constructor() {
    super("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    this.name = "CepLookupError";
  }
}

function isUf(value: string | undefined): value is Uf {
  return UFS.includes(value as Uf);
}

export function toCepEndereco(data: ViaCepResponse): CepEndereco {
  return {
    endereco: data.logradouro ?? "",
    complemento: data.complemento ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    estado: isUf(data.uf) ? data.uf : null,
  };
}

/**
 * Busca o endereço do CEP. Retorna `null` para CEP incompleto ou inexistente e
 * lança `CepLookupError` se o serviço falhar (rede, timeout, resposta inválida).
 * Cancelamentos via `signal` são repassados como AbortError.
 */
export async function buscarCep(
  cep: string,
  signal?: AbortSignal,
  fetchFn: typeof fetch = fetch,
): Promise<CepEndereco | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  let data: ViaCepResponse;
  try {
    const response = await fetchFn(`${VIACEP_ORIGIN}/ws/${digits}/json/`, {
      signal,
      headers: { Accept: "application/json" },
    });
    // 400 = formato inválido; tratamos como CEP não encontrado.
    if (response.status === 400) return null;
    if (!response.ok) throw new CepLookupError();
    data = (await response.json()) as ViaCepResponse;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw error instanceof CepLookupError ? error : new CepLookupError();
  }

  if (data.erro === true || data.erro === "true") return null;
  return toCepEndereco(data);
}
