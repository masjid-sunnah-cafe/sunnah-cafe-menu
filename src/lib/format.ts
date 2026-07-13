/** Format a price in EUR the Finnish way, e.g. 3.2 → "€3,20". */
export function formatPrice(n: number): string {
  return '€' + n.toFixed(2).replace('.', ',')
}
