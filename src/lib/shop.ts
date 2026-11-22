import { toast } from "sonner";
import { createPersistedStore } from "./local-store";

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number | null;
  color: string | null;
  qty: number;
  stock: number;
};

export type SavedProduct = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number | null;
};

const cart = createPersistedStore<CartItem[]>("bg-cart", []);
const wishlist = createPersistedStore<SavedProduct[]>("bg-wishlist", []);
const compare = createPersistedStore<string[]>("bg-compare", []);
const recent = createPersistedStore<string[]>("bg-recent", []);
const cartPulse = createPersistedStore<number>("bg-cart-pulse", 0);

export const useCart = cart.useStore;
export const useWishlist = wishlist.useStore;
export const useCompare = compare.useStore;
export const useRecent = recent.useStore;
export const useCartPulse = cartPulse.useStore;

export function addToCart(item: Omit<CartItem, "key" | "qty">, qty = 1) {
  if (item.stock <= 0) {
    toast.error("هذا المنتج غير متوفر حالياً");
    return false;
  }
  const key = `${item.productId}:${item.color ?? ""}`;
  cart.set((prev) => {
    const existing = prev.find((i) => i.key === key);
    if (existing) {
      return prev.map((i) =>
        i.key === key ? { ...i, ...item, qty: Math.min(i.qty + qty, item.stock, 20) } : i,
      );
    }
    return [...prev, { ...item, key, qty: Math.min(qty, item.stock, 20) }];
  });
  cartPulse.set((n) => n + 1);
  toast.success("أُضيف إلى السلة", { description: item.name });
  return true;
}

export function setCartQty(key: string, qty: number) {
  cart.set((prev) =>
    prev.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(qty, i.stock, 20)) } : i)),
  );
}

export function removeFromCart(key: string) {
  cart.set((prev) => prev.filter((i) => i.key !== key));
}

export function clearCart() {
  cart.set(() => []);
}

export function toggleWishlist(p: SavedProduct) {
  let added = false;
  wishlist.set((prev) => {
    if (prev.some((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
    added = true;
    return [p, ...prev];
  });
  toast(added ? "أُضيف إلى المفضلة" : "أُزيل من المفضلة", { description: p.name });
}

export function toggleCompare(id: string) {
  let msg = "";
  compare.set((prev) => {
    if (prev.includes(id)) {
      msg = "أُزيل من المقارنة";
      return prev.filter((x) => x !== id);
    }
    if (prev.length >= 4) {
      msg = "يمكن مقارنة 4 منتجات كحد أقصى";
      return prev;
    }
    msg = "أُضيف إلى المقارنة";
    return [...prev, id];
  });
  toast(msg);
}

export function pushRecent(id: string) {
  recent.set((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 12));
}
