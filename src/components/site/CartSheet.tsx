import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { removeFromCart, setCartQty, useCart } from "@/lib/shop";
import { cartTotals } from "@/lib/pricing";
import { formatIQD } from "@/lib/format";
import { settingsQuery } from "@/lib/queries";

export function useCartTotals() {
  const cart = useCart();
  const { data: s } = useQuery(settingsQuery());
  const fee = Number(s?.delivery_fee ?? 10000);
  const threshold = Number(s?.free_delivery_threshold ?? 500000);
  const totals = cartTotals(cart.map((i) => ({ price: i.price, oldPrice: i.oldPrice, qty: i.qty })), fee, threshold);
  return { cart, totals, fee, threshold, count: cart.reduce((n, i) => n + i.qty, 0) };
}

export function FreeDeliveryMeter({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  const left = Math.max(0, threshold - subtotal);
  return (
    <div className="rounded-xl bg-surface p-3">
      <p className="mb-2 flex items-center gap-2 text-sm">
        <Truck className="size-4 text-gold" />
        {left > 0 ? (
          <span>أضف <b className="num">{formatIQD(left)}</b> للحصول على توصيل مجاني</span>
        ) : (
          <span className="font-medium text-success">مبروك! طلبك مؤهل للتوصيل المجاني</span>
        )}
      </p>
      <Progress value={Math.min(100, (subtotal / threshold) * 100)} className="h-1.5" />
    </div>
  );
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const cart = useCart();
  return (
    <ul className="divide-y">
      {cart.map((i) => (
        <li key={i.key} className="flex gap-3 py-4">
          <Link to="/products/$slug" params={{ slug: i.slug }} className="shrink-0">
            <img src={i.image} alt={i.name} className={compact ? "size-20 rounded-xl bg-surface object-cover" : "size-24 rounded-xl bg-surface object-cover"} />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <Link to="/products/$slug" params={{ slug: i.slug }} className="line-clamp-2 text-sm font-medium hover:text-primary">{i.name}</Link>
            {i.color && <span className="mt-0.5 text-xs text-muted-foreground">اللون: {i.color}</span>}
            <div className="mt-auto flex items-center justify-between gap-2 pt-2">
              <div className="inline-flex items-center rounded-full border">
                <button type="button" aria-label="زيادة" onClick={() => setCartQty(i.key, i.qty + 1)} className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted"><Plus className="size-3.5" /></button>
                <span className="num w-7 text-center text-sm font-medium">{i.qty}</span>
                <button type="button" aria-label="إنقاص" onClick={() => setCartQty(i.key, i.qty - 1)} className="inline-flex size-8 items-center justify-center rounded-full hover:bg-muted"><Minus className="size-3.5" /></button>
              </div>
              <span className="text-sm font-bold">{formatIQD(i.price * i.qty)}</span>
            </div>
          </div>
          <button type="button" aria-label="حذف" onClick={() => removeFromCart(i.key)} className="self-start rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="size-4" /></button>
        </li>
      ))}
    </ul>
  );
}

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { cart, totals, threshold, count } = useCartTotals();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b p-5 text-start">
          <SheetTitle className="flex items-center gap-2">سلة التسوق <span className="num text-sm font-normal text-muted-foreground">({count})</span></SheetTitle>
        </SheetHeader>
        {cart.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="inline-flex size-20 items-center justify-center rounded-full bg-surface"><ShoppingBag className="size-8 text-muted-foreground" /></span>
            <p className="font-medium">سلتك فارغة</p>
            <Button asChild onClick={() => onOpenChange(false)} className="rounded-full"><Link to="/products">ابدأ التسوق</Link></Button>
          </div>
        ) : (
          <>
            <div className="p-5 pb-0"><FreeDeliveryMeter subtotal={totals.subtotal} threshold={threshold} /></div>
            <div className="flex-1 overflow-y-auto px-5"><CartLines compact /></div>
            <div className="space-y-3 border-t bg-surface/50 p-5">
              {totals.savings > 0 && <div className="flex justify-between text-sm text-success"><span>وفّرت</span><span>{formatIQD(totals.savings)}</span></div>}
              <div className="flex justify-between text-base font-bold"><span>المجموع</span><span>{formatIQD(totals.subtotal)}</span></div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="outline" className="h-12 rounded-xl" onClick={() => onOpenChange(false)}><Link to="/cart">عرض السلة</Link></Button>
                <Button asChild className="h-12 rounded-xl" onClick={() => onOpenChange(false)}><Link to="/checkout">إتمام الطلب</Link></Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
