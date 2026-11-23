import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { Check, Loader2, PackageSearch, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/site/PageHeader";
import { formatDateTime, formatIQD, ORDER_STATUS, PAYMENT_LABELS } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/track")({
  validateSearch: (s) => z.object({ order: z.string().max(30).optional() }).parse(s),
  head: () => ({
    meta: [
      { title: "تتبع الطلب – متجر الغيث" },
      { name: "description", content: "تابع حالة طلبك باستخدام رقم الطلب ورقم الهاتف." },
      { property: "og:title", content: "تتبع الطلب – متجر الغيث" },
      { property: "og:description", content: "تابع حالة طلبك لحظة بلحظة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TrackPage,
});

type Tracked = {
  order_number: string; status: string; created_at: string; city: string; customer_name: string; payment_method: string;
  subtotal: number; delivery_fee: number; savings: number; total: number;
  status_history: { status: string; at: string }[];
  items: { name: string; image: string | null; quantity: number; unit_price: number; color: string | null }[];
};

const STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;

function TrackPage() {
  const search = Route.useSearch();
  const [number, setNumber] = useState(search.order ?? "");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Tracked | null | undefined>(undefined);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.rpc("track_order", { p_order_number: number, p_phone: phone });
    setBusy(false);
    setResult(error ? null : ((data as Tracked | null) ?? null));
  }

  const stepIndex = result ? STEPS.indexOf(result.status as (typeof STEPS)[number]) : -1;
  const when = (st: string) => (st === "pending" ? result?.created_at : result?.status_history?.find((h) => h.status === st)?.at);

  return (
    <>
      <PageHeader title="تتبع الطلب" subtitle="أدخل رقم الطلب ورقم الهاتف المستخدم عند الطلب." crumbs={[{ label: "تتبع الطلب" }]} />
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="h-fit space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="num">رقم الطلب</Label>
            <Input id="num" dir="ltr" required placeholder="BG-1001" value={number} onChange={(e) => setNumber(e.target.value)} className="h-12 rounded-xl text-end" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ph">رقم الهاتف</Label>
            <Input id="ph" dir="ltr" type="tel" required placeholder="07xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-12 rounded-xl text-end" />
          </div>
          <Button type="submit" disabled={busy} className="h-12 w-full gap-2 rounded-xl">{busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}تتبع</Button>
        </form>
        <div>
          {result === undefined && (
            <div className="flex h-full min-h-60 flex-col items-center justify-center rounded-2xl border border-dashed text-center text-muted-foreground">
              <PackageSearch className="size-10" />
              <p className="mt-3 text-sm">ستظهر تفاصيل طلبك هنا</p>
            </div>
          )}
          {result === null && <p className="rounded-2xl bg-destructive/10 p-6 text-sm">لم نجد طلباً بهذه البيانات. تأكد من رقم الطلب ورقم الهاتف.</p>}
          {result && (
            <div className="space-y-6 rounded-2xl border bg-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">طلب رقم</p>
                  <p className="num text-xl font-bold text-gold">{result.order_number}</p>
                </div>
                <span className={cn("rounded-full border px-3 py-1 text-sm", ORDER_STATUS[result.status]?.tone)}>{ORDER_STATUS[result.status]?.label ?? result.status}</span>
              </div>
              {result.status === "cancelled" ? (
                <p className="rounded-xl bg-destructive/10 p-4 text-sm">تم إلغاء هذا الطلب. تواصل معنا لأي استفسار.</p>
              ) : (
                <ol className="grid gap-4 sm:grid-cols-4">
                  {STEPS.map((st, i) => {
                    const done = i <= stepIndex;
                    const t = when(st);
                    return (
                      <li key={st} className="flex items-center gap-3 sm:flex-col sm:text-center">
                        <span className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2", done ? "border-gold bg-gold text-gold-foreground" : "border-border text-muted-foreground")}>
                          {done ? <Check className="size-5" /> : <span className="num text-sm">{i + 1}</span>}
                        </span>
                        <span>
                          <span className={cn("block text-sm font-medium", !done && "text-muted-foreground")}>{ORDER_STATUS[st]?.label}</span>
                          {done && t && <span className="block text-xs text-muted-foreground">{formatDateTime(t)}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              )}
              <ul className="divide-y rounded-xl border">
                {result.items.map((it, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 text-sm">
                    {it.image && <img src={it.image} alt="" className="size-14 rounded-lg bg-surface object-cover" />}
                    <span className="flex-1">{it.name}{it.color && <span className="block text-xs text-muted-foreground">{it.color}</span>}</span>
                    <span className="num text-muted-foreground">×{it.quantity}</span>
                    <span className="font-medium">{formatIQD(it.unit_price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p><span className="text-muted-foreground">المحافظة: </span>{result.city}</p>
                <p><span className="text-muted-foreground">الدفع: </span>{PAYMENT_LABELS[result.payment_method] ?? result.payment_method}</p>
                <p><span className="text-muted-foreground">التوصيل: </span>{Number(result.delivery_fee) === 0 ? "مجاني" : formatIQD(result.delivery_fee)}</p>
                <p className="font-bold"><span className="font-normal text-muted-foreground">الإجمالي: </span>{formatIQD(result.total)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
