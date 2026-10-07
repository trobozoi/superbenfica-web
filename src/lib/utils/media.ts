import { BFF_ROUTES } from "./constants";

const MEDIA_PREFIX = "/media/";

/**
 * Converte a URL absoluta de uma foto da API (ex.: http://api/media/produtos/x.webp)
 * para a rota da própria loja (/api/media/produtos/x.webp). A imagem vem da mesma origem:
 * a CSP não precisa liberar o host da API e trocar a API para produção continua sendo
 * só mudar o .env.
 */
export function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  let pathname: string;
  try {
    pathname = url.startsWith("/") ? (url.split(/[?#]/)[0] ?? "") : new URL(url).pathname;
  } catch {
    return null;
  }
  const index = pathname.indexOf(MEDIA_PREFIX);
  if (index === -1) return null;
  return `${BFF_ROUTES.media}/${pathname.slice(index + MEDIA_PREFIX.length)}`;
}
