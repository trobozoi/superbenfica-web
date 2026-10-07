const LOCALE = "pt-BR";

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: "BRL" });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "short",
  timeStyle: "short",
});

/** A API envia decimais como string ("12.90"). Valores inválidos viram 0. */
export function toNumber(value: string | number | null | undefined): number {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatCurrency(value: string | number | null | undefined): string {
  return currencyFormatter.format(toNumber(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : dateTimeFormatter.format(date);
}

/** "07:00:00" -> "07:00". */
export function formatTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : "-";
}

/** Mantém só os dígitos (sem regex com backtracking). */
export function onlyDigits(value: string): string {
  let digits = "";
  for (const char of value) if (char >= "0" && char <= "9") digits += char;
  return digits;
}

/** "60000000" -> "60000-000" (formato aceito pela API). */
export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

/** Máscara de telefone brasileiro: (85) 99100-0005 ou (85) 3200-1000. */
export function formatTelefone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  const split = rest.length > 8 ? 5 : 4;
  if (rest.length <= split) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}
