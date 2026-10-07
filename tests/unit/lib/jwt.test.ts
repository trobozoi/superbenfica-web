import { describe, expect, it } from "vitest";
import { isCustomer, isExpired, sessionFromAccessToken, tokenExpiry } from "@/lib/utils/jwt";
import { fakeJwt } from "../helpers";

describe("jwt", () => {
  const claims = {
    user_id: "6",
    nome: "Cláudio Cliente",
    role: "CLIENTE",
    loja_id: 1,
    exp: 2_000_000_000,
  };

  it("extrai o usuário das claims da API", () => {
    expect(sessionFromAccessToken(fakeJwt(claims))).toEqual({
      id: 6,
      nome: "Cláudio Cliente",
      role: "CLIENTE",
      lojaId: 1,
      exp: 2_000_000_000,
    });
  });

  it("rejeita tokens sem perfil válido, sem exp ou ilegíveis", () => {
    expect(sessionFromAccessToken(fakeJwt({ ...claims, role: "HACKER" }))).toBeNull();
    expect(sessionFromAccessToken(fakeJwt({ ...claims, exp: undefined }))).toBeNull();
    expect(sessionFromAccessToken("lixo")).toBeNull();
    expect(sessionFromAccessToken(undefined)).toBeNull();
  });

  it("usa valores padrão para claims opcionais", () => {
    const user = sessionFromAccessToken(fakeJwt({ ...claims, nome: 1, loja_id: null }));
    expect(user?.nome).toBe("");
    expect(user?.lojaId).toBeNull();
  });

  it("lê a expiração de qualquer token", () => {
    expect(tokenExpiry(fakeJwt({ exp: 123 }))).toBe(123);
    expect(tokenExpiry(fakeJwt({}))).toBeNull();
    expect(tokenExpiry("lixo")).toBeNull();
    expect(tokenExpiry(null)).toBeNull();
  });

  it("considera expirado com margem de segurança", () => {
    const now = 1_000_000 * 1000;
    expect(isExpired(1_000_005, now)).toBe(true);
    expect(isExpired(1_000_100, now)).toBe(false);
    expect(isExpired(null, now)).toBe(true);
  });

  it("só considera cliente o perfil CLIENTE", () => {
    const user = sessionFromAccessToken(fakeJwt(claims));
    expect(isCustomer(user)).toBe(true);
    expect(isCustomer(user && { ...user, role: "CAIXA" })).toBe(false);
    expect(isCustomer(null)).toBe(false);
  });
});
