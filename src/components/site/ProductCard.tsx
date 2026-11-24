import { Link } from "@tanstack/react-router";
import { GitCompareArrows, Heart, ShoppingBag } from "lucide-react";
import type { ProductCardData } from "@/lib/catalog.functions";
import { discountPercent } from "@/lib/format";
import { addToCart, toggleCompare, toggleWishlist, useCompare, useWishlist } from "@/lib/shop";
import { cn } from "@/lib/utils";
import { Price } from "./Price";
import { Stars } from "./Stars";

export function ProductCard({ p, className }: { p: ProductCardData; className?: string }) {
  const wish = useWishlist();
  const compare = useCompare();
  const inWish = wish.some((w) => w.id === p.id);
  const inCompare = compare.includes(p.id);
  const off = discountPercent(p.price, p.old_price);
  const out = p.stock <= 0;
  const image = p.images[0] ?? "/images/products/microwave.webp";
  const saved = { id: p.id, slug: p.slug, name: p.name, image, price: p.price, oldPrice: p.old_price };

  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift", className)}>
      <div className="relative aspect-square overflow-hidden bg-surface">
        <Link to="/products/$slug" params={{ slug: p.slug }} aria-label={p.name} className="block h-full">
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            className={cn("h-full w-full object-cover transition duration-700 group-hover:scale-105", out && "opacity-60 grayscale")}
          />
        </Link>
        <div className="pointer-events-none absolute start-2 top-2 flex flex-col items-start gap-1 sm:start-3 sm:top-3 sm:gap-1.5">
          {off > 0 && <span className="num rounded-full bg-destructive px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs font-bold text-destructive-foreground">-{off}%</span>}
          {p.is_new && <span className="rounded-full bg-navy px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs font-medium text-navy-foreground">جديد</span>}
          {p.is_bestseller && <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] sm:px-2.5 sm:py-1 sm:text-xs font-medium text-gold-foreground">الأكثر مبيعاً</span>}
        </div>
        <div className="absolute end-2 top-2 flex flex-col gap-1.5 transition sm:end-3 sm:top-3 sm:gap-2 md:translate-x-[-8px] md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => toggleWishlist(saved)}
            aria-label={inWish ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            aria-pressed={inWish}
            className={cn("inline-flex size-8 items-center justify-center rounded-full bg-card/90 sm:size-9 shadow-soft backdrop-blur transition hover:bg-card", inWish && "md:opacity-100")}
          >
            <Heart className={cn("size-4", inWish ? "fill-destructive text-destructive" : "text-foreground")} />
          </button>
          <button
            type="button"
            onClick={() => toggleCompare(p.id)}
            aria-label="مقارنة"
            aria-pressed={inCompare}
            className={cn("inline-flex size-8 items-center justify-center rounded-full bg-card/90 sm:size-9 shadow-soft backdrop-blur transition hover:bg-card", inCompare && "bg-gold text-gold-foreground hover:bg-gold")}
          >
            <GitCompareArrows className="size-4" />
          </button>
        </div>
        {out && <span className="absolute inset-x-3 bottom-3 rounded-full bg-card/90 py-1.5 text-center text-xs font-medium backdrop-blur">نفدت الكمية</span>}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5 p-3 sm:gap-2 sm:p-4">
        {p.brand && <span className="text-xs font-medium tracking-wide text-gold">{p.brand.name}</span>}
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug sm:min-h-[2.75rem] sm:text-[15px]">
          <Link to="/products/$slug" params={{ slug: p.slug }} className="hover:text-primary">{p.name}</Link>
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Stars value={Number(p.rating)} size={13} />
          <span className="num">({p.review_count})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price price={p.price} oldPrice={p.old_price} size="sm" className="min-w-0 flex-col gap-y-0 sm:flex-row" />
          <button
            type="button"
            disabled={out}
            onClick={() => addToCart({ productId: p.id, slug: p.slug, name: p.name, image, price: p.price, oldPrice: p.old_price, color: p.colors[0]?.name ?? null, stock: p.stock })}
            aria-label={`أضف ${p.name} إلى السلة`}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary sm:size-10 text-primary-foreground transition hover:scale-105 hover:shadow-gold disabled:pointer-events-none disabled:opacity-40"
          >
            <ShoppingBag className="size-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card">
      <div className="shimmer aspect-square" />
      <div className="space-y-3 p-4">
        <div className="shimmer h-3 w-16 rounded" />
        <div className="shimmer h-4 w-full rounded" />
        <div className="shimmer h-4 w-2/3 rounded" />
        <div className="shimmer h-6 w-24 rounded" />
      </div>
    </div>
  );
}
