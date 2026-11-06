const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatMoney(cents: number) {
  return brl.format(cents / 100);
}

/** Valor em centavos para exibir num input ("125,00"). */
export function centsToInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

/**
 * "125" | "125,5" | "1.250,50" | "125.50" -> centavos. Retorna null se inválido.
 * Com vírgula, pontos são separador de milhar; sem vírgula, o ponto é decimal.
 */
export function parseMoney(input: string): number | null {
  const value = input.trim().replace(/^R\$\s*/, "");
  if (value === "") return null;
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}
