import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, EmptyState } from "@/components/site/PageHeader";
import { Price } from "@/components/site/Price";
import { toggleWishlist, useWishlist } from "@/lib/shop";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "المفضلة – متجر الغيث" },
      { name: "description", content: "المنتجات التي حفظتها في المفضلة." },
      { property: "og:title", content: "المفضلة – متجر الغيث" },
      { property: "og:description", content: "المنتجات التي حفظتها." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const items = useWishlist();
  return (
    <>
      <PageHeader title="المفضلة" subtitle="احفظ ما يعجبك وارجع إليه في أي وقت." crumbs={[{ label: "المفضلة" }]} />
      <div className="container-x py-10">
        {items.length === 0 ? (
          <EmptyState icon={<Heart className="size-8" />} title="لا توجد منتجات في المفضلة" text="اضغط على القلب في أي منتج لحفظه هنا." action={<Button asChild className="rounded-full"><Link to="/products">تصفح المنتجات</Link></Button>} />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border bg-card shadow-soft">
                <Link to="/products/$slug" params={{ slug: p.slug }} className="block aspect-square bg-surface">
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                </Link>
                <div className="space-y-3 p-4">
                  <Link to="/products/$slug" params={{ slug: p.slug }} className="line-clamp-2 text-sm font-semibold hover:text-primary">{p.name}</Link>
                  <Price price={p.price} oldPrice={p.oldPrice} size="sm" />
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1 gap-1.5 rounded-full"><Link to="/products/$slug" params={{ slug: p.slug }}><ShoppingBag className="size-4" />عرض</Link></Button>
                    <Button size="sm" variant="outline" aria-label="إزالة" className="rounded-full" onClick={() => toggleWishlist(p)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
