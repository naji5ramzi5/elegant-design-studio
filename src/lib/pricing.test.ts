import { describe, expect, it } from "vitest";
import { cartTotals, deliveryFeeFor } from "./pricing";

describe("delivery fee", () => {
  it("charges 10,000 IQD below the 500,000 IQD threshold", () => {
    expect(deliveryFeeFor(499_999, 10_000, 500_000)).toBe(10_000);
  });
  it("is free at 500,000 IQD and above", () => {
    expect(deliveryFeeFor(500_000, 10_000, 500_000)).toBe(0);
  });
});

describe("cart totals", () => {
  it("adds savings from old prices and the delivery fee", () => {
    const t = cartTotals([{ price: 165_000, oldPrice: 195_000, qty: 2 }], 10_000, 500_000);
    expect(t).toEqual({ subtotal: 330_000, savings: 60_000, delivery: 10_000, total: 340_000 });
  });
});
