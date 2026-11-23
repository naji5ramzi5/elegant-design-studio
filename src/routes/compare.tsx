import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GitCompareArrows, ShoppingBag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/site/PageHeader";
import { Price } from "@/components/site/Price";
import { Stars } from "@/components/site/Stars";
import { productsByIdsQuery } from "@/lib/queries";
import { addToCart, toggleCompare, useCompare } from "@/lib/shop";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "مقارنة المنتجات – متجر الغيث" },
      { name: "description", content: "قارن المواصفات والأسعار بين حتى 4 منتجات." },
      { property: "og:title", content: "مقارنة المنتجات – متجر الغيث" },
      { property: "og:description", content: "قارن المواصفات والأسعار جنباً إلى جنب." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ComparePage,
});

function ComparePage() {
  const ids = useCompare();
  const { data = [], isLoading } = useQuery({ ...productsByIdsQuery(ids), enabled: ids.length > 0 });
  const labels = Array.from(new Set(data.flatMap((p) => p.specs.map((s) => s.label))));

  return (
    <>
      <PageHeader title="مقارنة المنتجات" subtitle="أضف حتى 4 منتجات وقارن بينها بسهولة." crumbs={[{ label: "المقارنة" }]} />
      <div className="container-x py-10">
        {ids.length === 0 ? (
          <EmptyState icon={<GitCompareArrows className="size-8" />} title="لم تضف منتجات للمقارنة" text="اضغط على أيقونة المقارنة في بطاقة أي منتج." action={<Button asChild className="rounded-full"><Link to="/products">تصفح المنتجات</Link></Button>} />
        ) : isLoading ? (
          <div className="shimmer h-96 rounded-2xl" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border bg-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr>
                  <th className="w-40 p-4" />
                  {data.map((p) => (
                    <th key={p.id} className="p-4 align-top font-normal">
                      <div className="relative">
                        <button type="button" onClick={() => toggleCompare(p.id)} aria-label="إزالة" className="absolute end-0 top-0 rounded-full bg-card p-1.5 shadow-soft hover:text-destructive"><X className="size-4" /></button>
                        <Link to="/products/$slug" params={{ slug: p.slug }}><img src={p.images[0]} alt={p.name} className="mx-auto aspect-square w-36 rounded-xl bg-surface object-cover" /></Link>
                        <Link to="/products/$slug" params={{ slug: p.slug }} className="mt-3 line-clamp-2 block font-semibold hover:text-primary">{p.name}</Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(odd)]:bg-surface/60">
                <tr><th className="p-4 text-start font-medium text-muted-foreground">السعر</th>{data.map((p) => <td key={p.id} className="p-4"><Price price={p.price} oldPrice={p.old_price} size="sm" /></td>)}</tr>
                <tr><th className="p-4 text-start font-medium text-muted-foreground">الماركة</th>{data.map((p) => <td key={p.id} className="p-4">{p.brand?.name ?? "—"}</td>)}</tr>
                <tr><th className="p-4 text-start font-medium text-muted-foreground">التقييم</th>{data.map((p) => <td key={p.id} className="p-4"><Stars value={Number(p.rating)} /></td>)}</tr>
                <tr><th className="p-4 text-start font-medium text-muted-foreground">الضمان</th>{data.map((p) => <td key={p.id} className="p-4">{p.warranty ?? "—"}</td>)}</tr>
                <tr><th className="p-4 text-start font-medium text-muted-foreground">التوفر</th>{data.map((p) => <td key={p.id} className="p-4">{p.stock > 0 ? "متوفر" : "نفد"}</td>)}</tr>
                {labels.map((l) => (
                  <tr key={l}><th className="p-4 text-start font-medium text-muted-foreground">{l}</th>{data.map((p) => <td key={p.id} className="p-4">{p.specs.find((s) => s.label === l)?.value ?? "—"}</td>)}</tr>
                ))}
                <tr>
                  <th className="p-4" />
                  {data.map((p) => (
                    <td key={p.id} className="p-4">
                      <Button size="sm" disabled={p.stock <= 0} className="w-full gap-1.5 rounded-full" onClick={() => addToCart({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0] ?? "", price: p.price, oldPrice: p.old_price, color: p.colors[0]?.name ?? null, stock: p.stock })}>
                        <ShoppingBag className="size-4" />أضف للسلة
                      </Button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
