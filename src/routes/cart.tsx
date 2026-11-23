import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/site/PageHeader";
import { CartLines, FreeDeliveryMeter, useCartTotals } from "@/components/site/CartSheet";
import { formatIQD } from "@/lib/format";
import { clearCart } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "سلة التسوق – متجر الغيث" },
      { name: "description", content: "راجع منتجاتك قبل إتمام الطلب من متجر الغيث." },
      { property: "og:title", content: "سلة التسوق – متجر الغيث" },
      { property: "og:description", content: "راجع منتجاتك قبل إتمام الطلب." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { cart, totals, threshold, count } = useCartTotals();
  return (
    <>
      <PageHeader title="سلة التسوق" crumbs={[{ label: "السلة" }]} />
      <div className="container-x py-10">
        {cart.length === 0 ? (
          <EmptyState icon={<ShoppingBag className="size-8" />} title="سلتك فارغة" text="أضف منتجات لتبدأ طلبك." action={<Button asChild className="rounded-full"><Link to="/products">تصفح المنتجات</Link></Button>} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">المنتجات (<span className="num">{count}</span>)</h2>
                <button type="button" onClick={clearCart} className="text-sm text-muted-foreground hover:text-destructive">إفراغ السلة</button>
              </div>
              <CartLines />
            </div>
            <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
              <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-soft">
                <h2 className="font-semibold">ملخص الطلب</h2>
                <FreeDeliveryMeter subtotal={totals.subtotal} threshold={threshold} />
                <Row label="المجموع الفرعي" value={formatIQD(totals.subtotal)} />
                {totals.savings > 0 && <Row label="التوفير" value={`- ${formatIQD(totals.savings)}`} className="text-success" />}
                <Row label="التوصيل" value={totals.delivery === 0 ? "مجاني" : formatIQD(totals.delivery)} />
                <div className="gold-rule" />
                <Row label="الإجمالي" value={formatIQD(totals.total)} className="text-lg font-bold" />
                <Button asChild className="h-12 w-full rounded-xl text-base"><Link to="/checkout">إتمام الطلب</Link></Button>
                <Link to="/products" className="block text-center text-sm text-muted-foreground hover:text-foreground">متابعة التسوق</Link>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold" />منتجات أصلية بضمان رسمي</p>
                <p className="flex items-center gap-2"><Truck className="size-4 text-gold" />الدفع عند الاستلام متاح</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`flex items-center justify-between text-sm ${className ?? ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
