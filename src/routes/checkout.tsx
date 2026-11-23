import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Banknote, Building2, Loader2, Lock, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, EmptyState } from "@/components/site/PageHeader";
import { useCartTotals } from "@/components/site/CartSheet";
import { settingsQuery } from "@/lib/queries";
import { formatIQD, IRAQI_CITIES } from "@/lib/format";
import { clearCart } from "@/lib/shop";
import { cn } from "@/lib/utils";

const checkoutSchema = z.object({
  name: z.string().trim().min(3, "يرجى إدخال الاسم الكامل").max(80),
  phone: z.string().transform((v) => v.replace(/[\s-]/g, "")).pipe(z.string().regex(/^(\+?964|0)?7\d{9}$/, "رقم الهاتف غير صحيح (مثال: 07xxxxxxxxx)")),
  city: z.string().min(2, "يرجى اختيار المحافظة"),
  address: z.string().trim().min(5, "يرجى إدخال العنوان بالتفصيل").max(300),
  notes: z.string().trim().max(500).optional(),
});

export const Route = createFileRoute("/checkout")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery()),
  head: () => ({
    meta: [
      { title: "إتمام الطلب – متجر الغيث" },
      { name: "description", content: "أكمل طلبك بالدفع عند الاستلام أو التحويل البنكي." },
      { property: "og:title", content: "إتمام الطلب – متجر الغيث" },
      { property: "og:description", content: "أكمل طلبك بسهولة وأمان." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { data: s } = useSuspenseQuery(settingsQuery());
  const { cart, totals } = useCartTotals();
  const methods = [
    s?.cod_enabled !== false && { id: "cod", label: "الدفع عند الاستلام", desc: "ادفع نقداً عند وصول الطلب", icon: Banknote },
    s?.bank_transfer_enabled && { id: "bank_transfer", label: "تحويل بنكي", desc: "سنرسل لك تفاصيل الحساب", icon: Building2 },
  ].filter(Boolean) as { id: string; label: string; desc: string; icon: typeof Banknote }[];
  const [form, setForm] = useState({ name: "", phone: "", city: "", address: "", notes: "" });
  const [payment, setPayment] = useState(methods[0]?.id ?? "cod");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = checkoutSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setErrors(errs);
      toast.error("يرجى تصحيح الحقول المحددة");
      return;
    }
    setErrors({});
    setBusy(true);
    const { data, error } = await supabase.rpc("place_order", {
      p_customer: parsed.data,
      p_items: cart.map((i) => ({ product_id: i.productId, quantity: i.qty, color: i.color })),
      p_payment: payment,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message || "تعذر إرسال الطلب");
      return;
    }
    const result = data as { order_number: string; total: number };
    try {
      sessionStorage.setItem("bg-last-order", JSON.stringify({ ...result, payment, phone: parsed.data.phone }));
    } catch {
      /* ignore */
    }
    clearCart();
    navigate({ to: "/order/$number", params: { number: result.order_number } });
  }

  if (cart.length === 0) {
    return (
      <>
        <PageHeader title="إتمام الطلب" crumbs={[{ label: "السلة", to: "/cart" }, { label: "إتمام الطلب" }]} />
        <EmptyState icon={<ShoppingBag className="size-8" />} title="سلتك فارغة" action={<Button asChild className="rounded-full"><Link to="/products">تصفح المنتجات</Link></Button>} />
      </>
    );
  }

  return (
    <>
      <PageHeader title="إتمام الطلب" crumbs={[{ label: "السلة", to: "/cart" }, { label: "إتمام الطلب" }]} />
      <form onSubmit={submit} noValidate className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-5 text-lg font-semibold">معلومات التوصيل</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="الاسم الكامل" error={errors["name"]}>
                <Input id="name" autoComplete="name" value={form.name} onChange={(e) => set("name")(e.target.value)} className="h-12 rounded-xl" />
              </Field>
              <Field id="phone" label="رقم الهاتف" error={errors["phone"]}>
                <Input id="phone" type="tel" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="07xxxxxxxxx" value={form.phone} onChange={(e) => set("phone")(e.target.value)} className="h-12 rounded-xl text-end" />
              </Field>
              <Field id="city" label="المحافظة" error={errors["city"]}>
                <Select value={form.city} onValueChange={set("city")}>
                  <SelectTrigger id="city" className="h-12 rounded-xl"><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                  <SelectContent>{IRAQI_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field id="address" label="العنوان بالتفصيل" error={errors["address"]}>
                <Input id="address" autoComplete="street-address" placeholder="المنطقة، الشارع، أقرب نقطة دالة" value={form.address} onChange={(e) => set("address")(e.target.value)} className="h-12 rounded-xl" />
              </Field>
              <div className="sm:col-span-2">
                <Field id="notes" label="ملاحظات (اختياري)" error={errors["notes"]}>
                  <Textarea id="notes" value={form.notes} onChange={(e) => set("notes")(e.target.value)} className="min-h-20 rounded-xl" />
                </Field>
              </div>
            </div>
          </section>
          <section className="rounded-2xl border bg-card p-6">
            <h2 className="mb-5 text-lg font-semibold">طريقة الدفع</h2>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {methods.map((m) => (
                <button key={m.id} type="button" role="radio" aria-checked={payment === m.id} onClick={() => setPayment(m.id)} className={cn("flex items-start gap-3 rounded-2xl border-2 p-4 text-start transition", payment === m.id ? "border-gold bg-gold/5" : "border-border hover:border-foreground/20")}>
                  <m.icon className="mt-0.5 size-5 text-gold" />
                  <span><span className="block font-medium">{m.label}</span><span className="text-xs text-muted-foreground">{m.desc}</span></span>
                </button>
              ))}
            </div>
            {payment === "bank_transfer" && s?.bank_details && <p className="mt-4 whitespace-pre-line rounded-xl bg-surface p-4 text-sm leading-7">{s.bank_details}</p>}
          </section>
        </div>
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="font-semibold">طلبك</h2>
            <ul className="max-h-72 space-y-3 overflow-y-auto">
              {cart.map((i) => (
                <li key={i.key} className="flex items-center gap-3 text-sm">
                  <span className="relative">
                    <img src={i.image} alt="" className="size-14 rounded-xl bg-surface object-cover" />
                    <span className="num absolute -end-1.5 -top-1.5 inline-flex size-5 items-center justify-center rounded-full bg-navy text-[10px] text-navy-foreground">{i.qty}</span>
                  </span>
                  <span className="line-clamp-2 flex-1">{i.name}{i.color && <span className="block text-xs text-muted-foreground">{i.color}</span>}</span>
                  <span className="font-medium">{formatIQD(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="gold-rule" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>المجموع الفرعي</span><span>{formatIQD(totals.subtotal)}</span></div>
              {totals.savings > 0 && <div className="flex justify-between text-success"><span>التوفير</span><span>- {formatIQD(totals.savings)}</span></div>}
              <div className="flex justify-between"><span>التوصيل</span><span>{totals.delivery === 0 ? "مجاني" : formatIQD(totals.delivery)}</span></div>
              <div className="flex justify-between pt-2 text-lg font-bold"><span>الإجمالي</span><span>{formatIQD(totals.total)}</span></div>
            </div>
            <Button type="submit" disabled={busy} className="h-12 w-full gap-2 rounded-xl text-base">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}تأكيد الطلب
            </Button>
            <p className="text-center text-xs text-muted-foreground">سيتواصل معك فريقنا لتأكيد الطلب قبل الشحن.</p>
          </div>
        </aside>
      </form>
    </>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
