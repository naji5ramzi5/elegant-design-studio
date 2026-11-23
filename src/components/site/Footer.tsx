import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Clock, Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { settingsQuery, taxonomyQuery } from "@/lib/queries";
import { whatsappLink } from "@/lib/format";
import { Logo } from "./Logo";
import { NewsletterForm } from "./Newsletter";

export function Footer() {
  const { data: s } = useQuery(settingsQuery());
  const { data: tax } = useQuery(taxonomyQuery());
  const wa = s?.whatsapp ?? "9647886443032";
  return (
    <footer className="mt-24 bg-navy text-navy-foreground">
      <div className="container-x grid gap-10 border-b border-navy-foreground/10 py-14 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm font-medium text-gold">النشرة البريدية</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">كن أول من يعرف بالعروض الحصرية</h2>
          <p className="mt-2 text-sm text-navy-foreground/70">خصومات موسمية، منتجات جديدة ونصائح للعناية بأجهزتك — بدون إزعاج.</p>
        </div>
        <NewsletterForm className="self-center" />
      </div>
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="text-sm leading-7 text-navy-foreground/70">
            {s?.about_text?.slice(0, 160) ?? "وجهتك الموثوقة لأرقى الأجهزة المنزلية في العراق، بضمان حقيقي وخدمة ما بعد البيع."}
          </p>
          <div className="flex gap-2">
            {s?.facebook && <a href={s.facebook} target="_blank" rel="noreferrer" aria-label="فيسبوك" className="inline-flex size-9 items-center justify-center rounded-full bg-navy-foreground/10 hover:bg-gold hover:text-gold-foreground"><Facebook className="size-4" /></a>}
            {s?.instagram && <a href={s.instagram} target="_blank" rel="noreferrer" aria-label="انستغرام" className="inline-flex size-9 items-center justify-center rounded-full bg-navy-foreground/10 hover:bg-gold hover:text-gold-foreground"><Instagram className="size-4" /></a>}
            <a href={whatsappLink(wa)} target="_blank" rel="noreferrer" aria-label="واتساب" className="inline-flex size-9 items-center justify-center rounded-full bg-navy-foreground/10 hover:bg-gold hover:text-gold-foreground"><MessageCircle className="size-4" /></a>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">الأقسام</h3>
          <ul className="space-y-2.5 text-sm text-navy-foreground/70">
            {tax?.categories.slice(0, 6).map((c) => (
              <li key={c.id}><Link to="/categories/$slug" params={{ slug: c.slug }} className="hover:text-gold">{c.name}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">خدمة العملاء</h3>
          <ul className="space-y-2.5 text-sm text-navy-foreground/70">
            <li><Link to="/track" className="hover:text-gold">تتبع طلبك</Link></li>
            <li><Link to="/faq" className="hover:text-gold">الأسئلة الشائعة</Link></li>
            <li><Link to="/about" className="hover:text-gold">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-gold">تواصل معنا</Link></li>
            <li><Link to="/wishlist" className="hover:text-gold">المفضلة</Link></li>
            <li><Link to="/compare" className="hover:text-gold">مقارنة المنتجات</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">تواصل معنا</h3>
          <ul className="space-y-3 text-sm text-navy-foreground/70">
            <li className="flex items-center gap-2.5"><Phone className="size-4 text-gold" /><a href={`tel:${s?.phone ?? "07886443032"}`} className="num hover:text-gold">{s?.phone ?? "07886443032"}</a></li>
            <li className="flex items-center gap-2.5"><MessageCircle className="size-4 text-gold" /><a href={whatsappLink(wa)} target="_blank" rel="noreferrer" className="hover:text-gold">واتساب مباشر</a></li>
            {s?.email && <li className="flex items-center gap-2.5"><Mail className="size-4 text-gold" /><a href={`mailto:${s.email}`} className="hover:text-gold" dir="ltr">{s.email}</a></li>}
            {s?.address && <li className="flex items-start gap-2.5"><MapPin className="mt-0.5 size-4 shrink-0 text-gold" />{s.address}</li>}
            {s?.working_hours && <li className="flex items-start gap-2.5"><Clock className="mt-0.5 size-4 shrink-0 text-gold" />{s.working_hours}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-navy-foreground/60 sm:flex-row">
          <p>© <span className="num">{new Date().getFullYear()}</span> باسم الغيث للأجهزة المنزلية. جميع الحقوق محفوظة.</p>
          <p className="flex items-center gap-3"><span>الدفع عند الاستلام</span><span className="size-1 rounded-full bg-gold" /><span>تحويل بنكي</span><span className="size-1 rounded-full bg-gold" /><span>ضمان رسمي</span></p>
        </div>
      </div>
    </footer>
  );
}
