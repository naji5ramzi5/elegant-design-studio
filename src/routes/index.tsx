import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, BadgeCheck, CreditCard, Headphones, Quote, Truck } from "lucide-react";
import { homeQuery } from "@/lib/queries";
import { HeroCarousel } from "@/components/site/HeroCarousel";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Stars } from "@/components/site/Stars";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";
import type { ProductCardData } from "@/lib/catalog.functions";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(homeQuery()),
  head: () => ({
    meta: [
      { title: "متجر الغيث – أجهزة منزلية فاخرة في العراق" },
      { name: "description", content: "ثلاجات، غسالات، مكيفات، شاشات وأجهزة مطبخ من أشهر الماركات بضمان رسمي، توصيل لكل المحافظات والدفع عند الاستلام." },
      { property: "og:title", content: "متجر الغيث – كل ما يحتاجه منزلك في مكان واحد" },
      { property: "og:description", content: "أجهزة منزلية أصلية بأسعار بالدينار العراقي وتوصيل لجميع المحافظات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const TRUST = [
  { icon: Truck, title: "توصيل لكل العراق", text: "مجاني للطلبات الكبيرة" },
  { icon: BadgeCheck, title: "ضمان رسمي", text: "منتجات أصلية 100%" },
  { icon: CreditCard, title: "الدفع عند الاستلام", text: "أو تحويل بنكي" },
  { icon: Headphones, title: "دعم متواصل", text: "عبر الهاتف وواتساب" },
];

function Grid({ items }: { items: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {items.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  );
}

function HomePage() {
  const { data } = useSuspenseQuery(homeQuery());
  const hero = data.banners.filter((b) => b.placement === "hero");
  const promo = data.banners.filter((b) => b.placement === "promo");

  return (
    <>
      <HeroCarousel slides={hero} />

      <section className="container-x relative z-10 -mt-10">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border shadow-lift lg:grid-cols-4">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-3 bg-card p-4 md:p-6">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold"><t.icon className="size-5" /></span>
              <div><p className="text-sm font-semibold md:text-base">{t.title}</p><p className="text-xs text-muted-foreground">{t.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x mt-20">
        <SectionHeading eyebrow="تسوّق حسب القسم" title="أقسام المتجر" to="/categories" />
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-5">
          {data.categories.slice(0, 10).map((c) => (
            <Link key={c.id} to="/categories/$slug" params={{ slug: c.slug }} className="group w-40 shrink-0 snap-start md:w-auto">
              <div className="aspect-square overflow-hidden rounded-3xl border bg-surface shadow-soft">
                {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />}
              </div>
              <p className="mt-3 text-center text-sm font-medium group-hover:text-gold">{c.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {data.featured.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="اختيارات متجر الغيث" title="منتجات مميزة" to="/products" search={{ filter: "featured" }} />
          <Grid items={data.featured} />
        </section>
      )}

      {promo.length > 0 && (
        <section className="container-x mt-20 grid gap-5 md:grid-cols-2">
          {promo.slice(0, 2).map((b, i) => (
            <Link key={b.id} to={b.cta_link ?? "/products"} className={`group relative isolate flex min-h-64 overflow-hidden rounded-3xl p-8 ${i === 0 ? "bg-navy text-navy-foreground" : "bg-accent text-accent-foreground"}`}>
              <img src={b.image_url} alt="" loading="lazy" className="absolute inset-y-0 end-0 -z-10 h-full w-1/2 object-cover opacity-90 transition duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 -z-10 bg-gradient-to-l ${i === 0 ? "from-navy via-navy/80" : "from-accent via-accent/80"} to-transparent`} />
              <div className="max-w-[60%] self-center">
                {b.eyebrow && <p className="text-sm font-medium text-gold">{b.eyebrow}</p>}
                <h3 className="mt-2 text-2xl font-bold leading-snug">{b.title}</h3>
                {b.subtitle && <p className="mt-2 text-sm opacity-80">{b.subtitle}</p>}
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">{b.cta_label ?? "اكتشف"}<ArrowLeft className="size-4 transition group-hover:-translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </section>
      )}

      {data.offers.length > 0 && (
        <section className="mt-20 bg-surface/70 py-16">
          <div className="container-x">
            <SectionHeading eyebrow="لفترة محدودة" title={<>عروض <span className="text-gold">لا تُفوَّت</span></>} to="/products" search={{ filter: "offers" }} />
            <Grid items={data.offers} />
          </div>
        </section>
      )}

      <section className="container-x mt-20">
        <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-navy text-navy-foreground lg:grid-cols-2">
          <div className="p-8 md:p-12">
            <p className="text-sm font-medium text-gold">تقنية ذكية</p>
            <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">بيت أنظف… بدون مجهود</h2>
            <p className="mt-4 leading-8 text-navy-foreground/75">مكانس روبوتية ذكية بخرائط ليزرية ومسح تلقائي، تتحكم بها من هاتفك وتعود للشحن وحدها.</p>
            <Link to="/categories/$slug" params={{ slug: "vacuums" }} className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 font-semibold text-gold-foreground">اكتشف المكانس<ArrowLeft className="size-4" /></Link>
          </div>
          <video src="/videos/robot-vacuum.mp4" poster="/videos/robot-vacuum-poster.webp" autoPlay muted loop playsInline className="aspect-video h-full w-full object-cover" />
        </div>
      </section>

      {data.bestsellers.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="الأكثر طلباً" title="الأكثر مبيعاً" to="/products" search={{ sort: "bestselling" }} />
          <Grid items={data.bestsellers} />
        </section>
      )}

      {data.latest.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="جديد المتجر" title="وصل حديثاً" to="/products" search={{ filter: "new" }} />
          <Grid items={data.latest} />
        </section>
      )}

      {data.brands.length > 0 && (
        <section className="container-x mt-20">
          <p className="mb-6 text-center text-sm font-medium text-muted-foreground">ماركات عالمية نثق بها</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.brands.map((b) => (
              <Link key={b.id} to="/products" search={{ brand: b.slug }} className="rounded-full border bg-card px-6 py-3 text-sm font-semibold tracking-widest text-muted-foreground transition hover:border-gold hover:text-foreground" dir="ltr">
                {(b.name_en ?? b.name).toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      )}

      {data.reviews.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="آراء عملائنا" title="ثقة نعتز بها" />
          <div className="grid gap-5 md:grid-cols-3">
            {data.reviews.slice(0, 3).map((r) => (
              <figure key={r.id} className="relative rounded-3xl border bg-card p-6 shadow-soft">
                <Quote className="absolute end-6 top-6 size-8 text-gold/30" />
                <Stars value={r.rating} />
                <blockquote className="mt-4 leading-8 text-muted-foreground">{r.comment}</blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-navy font-semibold text-navy-foreground">{r.customer_name.slice(0, 1)}</span>
                  <span>
                    <span className="block text-sm font-semibold">{r.customer_name}</span>
                    {r.product && <Link to="/products/$slug" params={{ slug: r.product.slug }} className="text-xs text-muted-foreground hover:text-gold">{r.product.name}</Link>}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <RecentlyViewed />
    </>
  );
}
