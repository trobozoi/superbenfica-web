import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  handleUnauthorized,
  http,
  refreshSession,
  setSessionExpiredHandler,
} from "@/lib/api/client";

function unauthorized(config: Partial<InternalAxiosRequestConfig> = {}): AxiosError {
  const fullConfig = { headers: new AxiosHeaders(), url: "pedidos", ...config };
  return new AxiosError("401", "ERR", fullConfig, null, {
    status: 401,
    data: {},
    statusText: "",
    headers: {},
    config: fullConfig,
  });
}

describe("lib/api/client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    setSessionExpiredHandler(() => undefined);
  });

  it("usa o proxy do BFF com o cabeçalho anti-CSRF", () => {
    expect(http.defaults.baseURL).toBe("/api/proxy");
    expect(http.defaults.headers["X-Requested-With"]).toBe("XMLHttpRequest");
  });

  it("renova a sessão e repete a requisição após 401", async () => {
    vi.spyOn(axios, "post").mockResolvedValue({ data: {} });
    const retry = vi.spyOn(http, "request").mockResolvedValue({ data: "ok" });
    await expect(handleUnauthorized(unauthorized())).resolves.toEqual({ data: "ok" });
    expect(axios.post).toHaveBeenCalledWith("/api/auth/refresh", null, expect.anything());
    expect(retry).toHaveBeenCalledWith(expect.objectContaining({ _retried: true }));
  });

  it("avisa que a sessão expirou quando o refresh falha", async () => {
    vi.spyOn(axios, "post").mockRejectedValue(new Error("401"));
    const expired = vi.fn();
    setSessionExpiredHandler(expired);
    await expect(handleUnauthorized(unauthorized())).rejects.toBeInstanceOf(AxiosError);
    expect(expired).toHaveBeenCalledOnce();
  });

  it("não tenta de novo requisições já repetidas ou outros erros", async () => {
    const post = vi.spyOn(axios, "post");
    await expect(
      handleUnauthorized(unauthorized({ _retried: true } as Partial<InternalAxiosRequestConfig>)),
    ).rejects.toBeInstanceOf(AxiosError);
    const notFound = unauthorized();
    if (notFound.response) notFound.response.status = 404;
    await expect(handleUnauthorized(notFound)).rejects.toBe(notFound);
    expect(post).not.toHaveBeenCalled();
  });

  it("faz um único refresh para várias requisições simultâneas", async () => {
    const post = vi.spyOn(axios, "post").mockResolvedValue({ data: {} });
    await Promise.all([refreshSession(), refreshSession(), refreshSession()]);
    expect(post).toHaveBeenCalledTimes(1);
  });
});
