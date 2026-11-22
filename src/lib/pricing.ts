export type CartLine = { price: number; oldPrice?: number | null; qty: number };

/** Mirrors the server-side rule in place_order: free delivery at or above the threshold. */
export function deliveryFeeFor(subtotal: number, fee: number, freeThreshold: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= freeThreshold ? 0 : fee;
}

export function cartTotals(lines: CartLine[], fee: number, freeThreshold: number) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const savings = lines.reduce(
    (s, l) => s + (l.oldPrice && l.oldPrice > l.price ? (l.oldPrice - l.price) * l.qty : 0),
    0,
  );
  const delivery = deliveryFeeFor(subtotal, fee, freeThreshold);
  return { subtotal, savings, delivery, total: subtotal + delivery };
}
