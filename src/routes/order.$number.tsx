import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatIQD, PAYMENT_LABELS, whatsappLink } from "@/lib/format";

export const Route = createFileRoute("/order/$number")({
  head: () => ({
    meta: [
      { title: "تم استلام طلبك – باسم الغيث" },
      { name: "description", content: "شكراً لطلبك من باسم الغيث." },
      { property: "og:title", content: "تم استلام طلبك – باسم الغيث" },
      { property: "og:description", content: "شكراً لطلبك من باسم الغيث." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { number } = Route.useParams();
  const [info, setInfo] = useState<{ total: number; payment: string; phone: string } | null>(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("bg-last-order");
      if (raw) {
        const v = JSON.parse(raw) as { order_number: string; total: number; payment: string; phone: string };
        if (v.order_number === number) setInfo(v);
      }
    } catch {
      /* ignore */
    }
  }, [number]);

  return (
    <div className="container-x flex justify-center py-16">
      <div className="w-full max-w-lg rounded-3xl border bg-card p-8 text-center shadow-lift md:p-10">
        <span className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-10" /></span>
        <h1 className="mt-6 text-2xl font-bold md:text-3xl">شكراً لك! تم استلام طلبك</h1>
        <p className="mt-3 text-muted-foreground">سيتصل بك فريقنا قريباً لتأكيد الطلب وموعد التوصيل.</p>
        <div className="mt-8 rounded-2xl bg-surface p-5">
          <p className="text-sm text-muted-foreground">رقم الطلب</p>
          <button type="button" onClick={() => { navigator.clipboard?.writeText(number); toast.success("تم نسخ رقم الطلب"); }} className="num mt-1 inline-flex items-center gap-2 text-2xl font-bold tracking-wider text-gold">
            {number}<Copy className="size-4" />
          </button>
          {info && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-card p-3"><p className="text-muted-foreground">الإجمالي</p><p className="font-semibold">{formatIQD(info.total)}</p></div>
              <div className="rounded-xl bg-card p-3"><p className="text-muted-foreground">الدفع</p><p className="font-semibold">{PAYMENT_LABELS[info.payment] ?? info.payment}</p></div>
            </div>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">احتفظ برقم الطلب ورقم هاتفك لتتبع الطلب.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button asChild className="h-12 rounded-xl"><Link to="/track" search={{ order: number }}>تتبع الطلب</Link></Button>
          <Button asChild variant="outline" className="h-12 rounded-xl"><a href={whatsappLink("9647886443032", `مرحباً، بخصوص طلبي رقم ${number}`)} target="_blank" rel="noreferrer">تواصل عبر واتساب</a></Button>
        </div>
        <Link to="/products" className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground">متابعة التسوق</Link>
      </div>
    </div>
  );
}
