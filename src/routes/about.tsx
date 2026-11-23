import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Award, HeartHandshake, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/site/PageHeader";
import { settingsQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery()),
  head: () => ({
    meta: [
      { title: "من نحن – باسم الغيث" },
      { name: "description", content: "تعرّف على باسم الغيث، وجهتك الموثوقة للأجهزة المنزلية الأصلية في العراق." },
      { property: "og:title", content: "من نحن – باسم الغيث" },
      { property: "og:description", content: "وجهتك الموثوقة للأجهزة المنزلية الأصلية في العراق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  { icon: ShieldCheck, title: "منتجات أصلية", text: "نتعامل مع الوكلاء الرسميين مباشرة وبضمان حقيقي." },
  { icon: Truck, title: "توصيل لكل العراق", text: "من بغداد إلى البصرة وأربيل، نوصل طلبك بأمان." },
  { icon: HeartHandshake, title: "خدمة ما بعد البيع", text: "فريق دعم يتابع معك التركيب والصيانة." },
  { icon: Award, title: "أسعار عادلة", text: "عروض حقيقية وأسعار واضحة بالدينار العراقي." },
];

function AboutPage() {
  const { data: s } = useSuspenseQuery(settingsQuery());
  return (
    <>
      <PageHeader title="من نحن" crumbs={[{ label: "من نحن" }]} />
      <section className="container-x grid items-center gap-10 py-14 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium text-gold">قصتنا</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight md:text-4xl">نصنع الراحة في كل بيت عراقي</h2>
          <p className="mt-6 whitespace-pre-line leading-8 text-muted-foreground">
            {s?.about_text ?? "باسم الغيث متجر متخصص في الأجهزة المنزلية الفاخرة، نختار لك أفضل الماركات العالمية ونقدمها بضمان رسمي وخدمة تليق بك."}
          </p>
          <Button asChild className="mt-8 rounded-full px-6"><Link to="/products">تسوّق الآن</Link></Button>
        </div>
        <div className="relative">
          <img src="/images/hero/kitchen.webp" alt="مطبخ عصري بأجهزة باسم الغيث" className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift" />
          <div className="absolute -bottom-6 start-6 rounded-2xl bg-navy p-5 text-navy-foreground shadow-lift">
            <p className="num text-3xl font-bold text-gold">+10,000</p>
            <p className="text-sm">عميل سعيد في العراق</p>
          </div>
        </div>
      </section>
      <section className="container-x grid gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {VALUES.map((v) => (
          <div key={v.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><v.icon className="size-6" /></span>
            <h3 className="mt-4 font-semibold">{v.title}</h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{v.text}</p>
          </div>
        ))}
      </section>
    </>
  );
}
