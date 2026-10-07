import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { BFF_ROUTES } from "@/lib/utils/constants";
import { singleFlight } from "@/lib/utils/single-flight";

/**
 * Cliente HTTP do navegador. Todas as chamadas passam pelo BFF (/api/proxy), que injeta
 * o token guardado em cookie httpOnly: o JavaScript da página nunca vê os tokens.
 */

const REQUEST_TIMEOUT_MS = 20_000;

/** Cabeçalho anti-CSRF exigido pelas rotas do BFF (veja lib/server/csrf.ts). */
export const CSRF_HEADER = { "X-Requested-With": "XMLHttpRequest" } as const;

export const http = axios.create({
  baseURL: BFF_ROUTES.proxy,
  timeout: REQUEST_TIMEOUT_MS,
  headers: CSRF_HEADER,
  withCredentials: true,
});

/** Renova a sessão uma única vez, mesmo que várias requisições recebam 401 juntas. */
export const refreshSession = singleFlight(async (): Promise<boolean> => {
  try {
    await axios.post(BFF_ROUTES.refresh, null, { headers: CSRF_HEADER });
    return true;
  } catch {
    return false;
  }
});

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => undefined;

/** O AuthProvider registra aqui o que fazer quando a sessão não puder ser renovada. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

/** Interceptor: em 401, renova a sessão uma vez e repete a requisição original. */
export async function handleUnauthorized(error: AxiosError): Promise<unknown> {
  const config = error.config as RetriableConfig | undefined;
  if (error.response?.status !== 401 || !config || config._retried) {
    throw error;
  }
  config._retried = true;
  const renewed = await refreshSession();
  if (!renewed) {
    onSessionExpired();
    throw error;
  }
  return http.request(config);
}

http.interceptors.response.use((response) => response, handleUnauthorized);
