import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Clock, Loader2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/site/PageHeader";
import { settingsQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/format";

const schema = z.object({
  name: z.string().trim().min(2, "يرجى كتابة اسمك").max(80),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().max(120).optional(),
  message: z.string().trim().min(10, "الرسالة قصيرة جداً").max(2000),
});

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery()),
  head: () => ({
    meta: [
      { title: "تواصل معنا – متجر الغيث" },
      { name: "description", content: "تواصل مع فريق متجر الغيث عبر الهاتف أو واتساب أو نموذج الرسائل." },
      { property: "og:title", content: "تواصل معنا – متجر الغيث" },
      { property: "og:description", content: "فريقنا جاهز للإجابة على استفساراتك." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: s } = useSuspenseQuery(settingsQuery());
  const [form, setForm] = useState({ name: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const wa = s?.whatsapp ?? "9647886443032";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: parsed.data.name,
      message: parsed.data.message,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
    });
    setBusy(false);
    if (error) {
      toast.error("تعذر إرسال الرسالة");
      return;
    }
    setForm({ name: "", phone: "", subject: "", message: "" });
    toast.success("تم إرسال رسالتك", { description: "سنعود إليك في أقرب وقت." });
  }

  const cards = [
    { icon: Phone, label: "اتصل بنا", value: s?.phone ?? "07886443032", href: `tel:${s?.phone ?? "07886443032"}`, ltr: true },
    { icon: MessageCircle, label: "واتساب", value: "راسلنا مباشرة", href: whatsappLink(wa), ltr: false },
    ...(s?.email ? [{ icon: Mail, label: "البريد", value: s.email, href: `mailto:${s.email}`, ltr: true }] : []),
  ];

  return (
    <>
      <PageHeader title="تواصل معنا" subtitle="نسعد بخدمتك والإجابة على كل استفساراتك." crumbs={[{ label: "تواصل معنا" }]} />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {cards.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><c.icon className="size-5" /></span>
              <span><span className="block text-sm text-muted-foreground">{c.label}</span><span className={c.ltr ? "num font-semibold" : "font-semibold"}>{c.value}</span></span>
            </a>
          ))}
          {s?.address && <p className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-sm"><MapPin className="size-5 shrink-0 text-gold" />{s.address}</p>}
          {s?.working_hours && <p className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-sm"><Clock className="size-5 shrink-0 text-gold" />{s.working_hours}</p>}
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft md:p-8">
          <h2 className="text-xl font-semibold">أرسل لنا رسالة</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="c-name">الاسم</Label><Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 rounded-xl" /></div>
            <div className="space-y-2"><Label htmlFor="c-phone">الهاتف (اختياري)</Label><Input id="c-phone" type="tel" dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="h-12 rounded-xl text-end" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="c-subject">الموضوع (اختياري)</Label><Input id="c-subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="h-12 rounded-xl" /></div>
          <div className="space-y-2"><Label htmlFor="c-msg">الرسالة</Label><Textarea id="c-msg" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="min-h-36 rounded-xl" /></div>
          <Button type="submit" disabled={busy} className="h-12 gap-2 rounded-xl px-8">{busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}إرسال</Button>
        </form>
      </div>
    </>
  );
}
