import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, GitCompareArrows, Heart, Minus, Play, Plus, RotateCcw, ShieldCheck, ShoppingBag, Truck, Zap } from "lucide-react";
import { productQuery, settingsQuery } from "@/lib/queries";
import { addToCart, pushRecent, toggleCompare, toggleWishlist, useCompare, useWishlist } from "@/lib/shop";
import { discountPercent, formatDate, formatIQD, whatsappLink } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/site/PageHeader";
import { Price } from "@/components/site/Price";
import { Stars } from "@/components/site/Stars";
import { ProductCard } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ReviewForm } from "@/components/site/ReviewForm";
import { RecentlyViewed } from "@/components/site/RecentlyViewed";

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!data) throw notFound();
    return { name: data.product.name, description: data.product.short_description, image: data.product.images[0] ?? null };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} – باسم الغيث` },
          { name: "description", content: loaderData.description ?? `${loaderData.name} بضمان رسمي من باسم الغيث.` },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.description ?? "متوفر الآن لدى باسم الغيث." },
          { property: "og:type", content: "product" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "المنتج غير متوفر – باسم الغيث" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(productQuery(slug));
  const { data: settings } = useSuspenseQuery(settingsQuery());
  const wish = useWishlist();
  const compare = useCompare();
  const [active, setActive] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState<string | null>(null);

  const product = data?.product;
  useEffect(() => {
    if (!product) return;
    pushRecent(product.id);
    setActive(0);
    setShowVideo(false);
    setQty(1);
    setColor(product.colors[0]?.name ?? null);
  }, [product]);

  if (!data || !product) return null;
  const { reviews, related } = data;
  const images = product.images.length ? product.images : ["/images/products/microwave.webp"];
  const off = discountPercent(product.price, product.old_price);
  const out = product.stock <= 0;
  const inWish = wish.some((w) => w.id === product.id);
  const inCompare = compare.includes(product.id);
  const item = { productId: product.id, slug: product.slug, name: product.name, image: images[0]!, price: product.price, oldPrice: product.old_price, color, stock: product.stock };
  const waText = `مرحباً، أود طلب: ${product.name}${color ? ` (اللون: ${color})` : ""} – الكمية ${qty} – السعر ${formatIQD(product.price)}`;

  return (
    <>
      <PageHeader
        title={<span className="sr-only">{product.name}</span>}
        crumbs={[
          { label: "المنتجات", to: "/products" },
          ...(product.category ? [{ label: product.category.name, to: `/categories/${product.category.slug}` }] : []),
          { label: product.name },
        ]}
      />
      <div className="container-x -mt-6 grid gap-10 py-10 lg:grid-cols-2 lg:gap-14">
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className={cn("relative overflow-hidden rounded-3xl border bg-surface", showVideo && product.video_orientation === "vertical" ? "mx-auto aspect-[9/16] max-h-[640px]" : "aspect-square")}>
            {showVideo && product.video_url ? (
              <video src={product.video_url} poster={product.video_poster ?? undefined} controls autoPlay playsInline className="h-full w-full object-cover" />
            ) : (
              <img src={images[active]} alt={product.name} className="h-full w-full object-cover" />
            )}
            {off > 0 && !showVideo && <span className="num absolute start-4 top-4 rounded-full bg-destructive px-3 py-1.5 text-sm font-bold text-destructive-foreground">-{off}%</span>}
          </div>
          <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto">
            {images.map((src, i) => (
              <button key={src + i} type="button" onClick={() => { setActive(i); setShowVideo(false); }} aria-label={`صورة ${i + 1}`} className={cn("size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-surface", !showVideo && active === i ? "border-gold" : "border-transparent")}>
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            {product.video_url && (
              <button type="button" onClick={() => setShowVideo(true)} aria-label="شاهد الفيديو" className={cn("relative size-20 shrink-0 overflow-hidden rounded-xl border-2 bg-navy", showVideo ? "border-gold" : "border-transparent")}>
                {product.video_poster && <img src={product.video_poster} alt="" className="h-full w-full object-cover opacity-60" />}
                <Play className="absolute inset-0 m-auto size-7 fill-gold text-gold" />
              </button>
            )}
          </div>
        </div>

        <div>
          {product.brand && <Link to="/products" search={{ brand: product.brand.slug }} className="text-sm font-semibold tracking-wide text-gold">{product.brand.name}</Link>}
          <h1 className="mt-2 text-2xl font-bold leading-snug md:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Stars value={Number(product.rating)} />
            <span className="num">{Number(product.rating).toFixed(1)}</span>
            <span>({product.review_count} تقييم)</span>
            {product.model_number && <span className="num rounded-md bg-surface px-2 py-0.5 text-xs">{product.model_number}</span>}
          </div>
          {product.short_description && <p className="mt-5 leading-8 text-muted-foreground">{product.short_description}</p>}

          <div className="mt-6 rounded-2xl border bg-card p-5 shadow-soft">
            <Price price={product.price} oldPrice={product.old_price} size="lg" />
            {product.old_price && product.old_price > product.price && (
              <p className="mt-1 text-sm font-medium text-success">وفّر {formatIQD(product.old_price - product.price)}</p>
            )}
            <p className={cn("mt-3 inline-flex items-center gap-1.5 text-sm font-medium", out ? "text-destructive" : product.stock <= 3 ? "text-gold" : "text-success")}>
              <span className="size-2 rounded-full bg-current" />
              {out ? "نفدت الكمية" : product.stock <= 3 ? `متبقٍ ${product.stock} قطع فقط` : "متوفر في المخزون"}
            </p>

            {product.colors.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm">اللون: <span className="font-semibold">{color}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <button key={c.name} type="button" onClick={() => setColor(c.name)} aria-label={c.name} aria-pressed={color === c.name} className={cn("relative size-10 rounded-full border-2 p-0.5 transition", color === c.name ? "border-gold" : "border-border")}>
                      <span className="block h-full w-full rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                      {color === c.name && <Check className="absolute inset-0 m-auto size-4 text-gold mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex h-12 items-center rounded-full border">
                <button type="button" aria-label="زيادة" onClick={() => setQty((q) => Math.min(q + 1, Math.max(1, product.stock), 20))} className="inline-flex size-12 items-center justify-center rounded-full hover:bg-muted"><Plus className="size-4" /></button>
                <span className="num w-8 text-center font-semibold">{qty}</span>
                <button type="button" aria-label="إنقاص" onClick={() => setQty((q) => Math.max(1, q - 1))} className="inline-flex size-12 items-center justify-center rounded-full hover:bg-muted"><Minus className="size-4" /></button>
              </div>
              <Button disabled={out} onClick={() => addToCart(item, qty)} className="h-12 flex-1 gap-2 rounded-full text-base"><ShoppingBag className="size-5" />أضف إلى السلة</Button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Button disabled={out} variant="outline" className="h-12 gap-2 rounded-full border-gold text-base hover:bg-gold hover:text-gold-foreground" onClick={() => { if (addToCart(item, qty)) navigate({ to: "/checkout" }); }}>
                <Zap className="size-4" />اشترِ الآن
              </Button>
              <Button asChild variant="outline" className="h-12 gap-2 rounded-full text-base">
                <a href={whatsappLink(settings?.whatsapp ?? "9647886443032", waText)} target="_blank" rel="noreferrer">اطلب عبر واتساب</a>
              </Button>
            </div>
            <div className="mt-4 flex gap-4 text-sm">
              <button type="button" onClick={() => toggleWishlist({ id: product.id, slug: product.slug, name: product.name, image: images[0]!, price: product.price, oldPrice: product.old_price })} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Heart className={cn("size-4", inWish && "fill-destructive text-destructive")} />{inWish ? "في المفضلة" : "أضف للمفضلة"}
              </button>
              <button type="button" onClick={() => toggleCompare(product.id)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <GitCompareArrows className={cn("size-4", inCompare && "text-gold")} />{inCompare ? "في المقارنة" : "قارن"}
              </button>
            </div>
          </div>

          <ul className="mt-6 grid gap-3 sm:grid-cols-3">
            <li className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm"><Truck className="size-5 shrink-0 text-gold" />توصيل لكل المحافظات</li>
            <li className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm"><ShieldCheck className="size-5 shrink-0 text-gold" />{product.warranty ?? "ضمان رسمي"}</li>
            <li className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm"><RotateCcw className="size-5 shrink-0 text-gold" />استبدال خلال 7 أيام</li>
          </ul>
        </div>
      </div>

      <div className="container-x">
        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-2xl bg-surface p-1.5">
            <TabsTrigger value="specs" className="rounded-xl px-5 py-2.5">المواصفات</TabsTrigger>
            <TabsTrigger value="desc" className="rounded-xl px-5 py-2.5">الوصف</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-xl px-5 py-2.5">التقييمات ({reviews.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <dl className="overflow-hidden rounded-2xl border">
                {product.specs.map((s, i) => (
                  <div key={s.label} className={cn("grid grid-cols-2 gap-4 px-5 py-3.5 text-sm", i % 2 === 0 && "bg-surface/60")}>
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium">{s.value}</dd>
                  </div>
                ))}
              </dl>
              {product.features.length > 0 && (
                <ul className="space-y-3">
                  {product.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-7"><span className="mt-1 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"><Check className="size-3" /></span>{f}</li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="desc" className="mt-6">
            <p className="max-w-3xl whitespace-pre-line leading-8 text-muted-foreground">{product.description ?? product.short_description}</p>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {reviews.length === 0 && <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج.</p>}
                {reviews.map((r) => (
                  <article key={r.id} className="rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-10 items-center justify-center rounded-full bg-navy font-semibold text-navy-foreground">{r.customer_name.slice(0, 1)}</span>
                        <div>
                          <p className="font-medium">{r.customer_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(r.created_at)}</p>
                        </div>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-3 text-sm leading-7 text-muted-foreground">{r.comment}</p>}
                  </article>
                ))}
              </div>
              <ReviewForm productId={product.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {related.length > 0 && (
        <section className="container-x mt-20">
          <SectionHeading eyebrow="قد يعجبك أيضاً" title="منتجات مشابهة" to="/products" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
      <RecentlyViewed excludeId={product.id} />
    </>
  );
}
