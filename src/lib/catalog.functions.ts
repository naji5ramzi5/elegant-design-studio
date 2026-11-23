import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Tables } from "@/integrations/supabase/types";

function publicDb() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const CARD_COLS =
  "id, slug, name, short_description, price, old_price, stock, images, rating, review_count, sales_count, is_new, is_bestseller, is_featured, colors, created_at, brand:brands(name, slug), category:categories(name, slug)";

export type Spec = { label: string; value: string };
export type ProductColor = { name: string; hex: string };

export type ProductCardData = Pick<
  Tables<"products">,
  | "id" | "slug" | "name" | "short_description" | "price" | "old_price" | "stock" | "images"
  | "rating" | "review_count" | "sales_count" | "is_new" | "is_bestseller" | "is_featured" | "created_at"
> & {
  colors: ProductColor[];
  brand: { name: string; slug: string } | null;
  category: { name: string; slug: string } | null;
};

function toCard(row: unknown): ProductCardData {
  const r = row as ProductCardData & { colors: unknown };
  return { ...r, price: Number(r.price), old_price: r.old_price == null ? null : Number(r.old_price), colors: (Array.isArray(r.colors) ? r.colors : []) as ProductColor[] };
}

export const getStoreSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicDb().from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
});

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicDb();
  const [banners, categories, brands, featured, latest, best, offers, reviews] = await Promise.all([
    db.from("banners").select("*").eq("is_active", true).order("sort_order"),
    db.from("categories").select("*").eq("is_active", true).order("sort_order"),
    db.from("brands").select("*").order("name"),
    db.from("products").select(CARD_COLS).eq("is_published", true).eq("is_featured", true).order("created_at", { ascending: false }).limit(8),
    db.from("products").select(CARD_COLS).eq("is_published", true).eq("is_new", true).order("created_at", { ascending: false }).limit(8),
    db.from("products").select(CARD_COLS).eq("is_published", true).order("sales_count", { ascending: false }).limit(8),
    db.from("products").select(CARD_COLS).eq("is_published", true).not("old_price", "is", null).order("created_at", { ascending: false }).limit(8),
    db.from("reviews").select("id, customer_name, rating, comment, created_at, product:products(name, slug)").eq("is_approved", true).gte("rating", 4).order("created_at", { ascending: false }).limit(6),
  ]);
  for (const r of [banners, categories, brands, featured, latest, best, offers, reviews]) if (r.error) throw new Error(r.error.message);
  return {
    banners: banners.data ?? [],
    categories: categories.data ?? [],
    brands: brands.data ?? [],
    featured: (featured.data ?? []).map(toCard),
    latest: (latest.data ?? []).map(toCard),
    bestsellers: (best.data ?? []).map(toCard),
    offers: (offers.data ?? []).map(toCard).filter((p) => p.old_price && p.old_price > p.price),
    reviews: (reviews.data ?? []) as Array<{ id: string; customer_name: string; rating: number; comment: string | null; created_at: string; product: { name: string; slug: string } | null }>,
  };
});

export const getTaxonomy = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicDb();
  const [categories, brands] = await Promise.all([
    db.from("categories").select("*").eq("is_active", true).order("sort_order"),
    db.from("brands").select("*").order("name"),
  ]);
  if (categories.error) throw new Error(categories.error.message);
  if (brands.error) throw new Error(brands.error.message);
  return { categories: categories.data ?? [], brands: brands.data ?? [] };
});

export const SORTS = ["newest", "price-asc", "price-desc", "bestselling", "rating"] as const;
export const FILTERS = ["new", "offers", "bestsellers", "featured"] as const;

export const productListSchema = z.object({
  q: z.string().max(80).optional(),
  category: z.string().max(60).optional(),
  brand: z.string().max(60).optional(),
  filter: z.enum(FILTERS).optional(),
  sort: z.enum(SORTS).optional(),
  min: z.coerce.number().min(0).optional(),
  max: z.coerce.number().min(0).optional(),
  instock: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).max(100).optional(),
});
export type ProductListParams = z.infer<typeof productListSchema>;
export const PAGE_SIZE = 12;

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator((d: ProductListParams) => productListSchema.parse(d))
  .handler(async ({ data }) => {
    const db = publicDb();
    const cols = CARD_COLS.replace("brand:brands(name, slug)", data.brand ? "brand:brands!inner(name, slug)" : "brand:brands(name, slug)").replace(
      "category:categories(name, slug)",
      data.category ? "category:categories!inner(name, slug)" : "category:categories(name, slug)",
    );
    let q = db.from("products").select(cols, { count: "exact" }).eq("is_published", true);
    if (data.category) q = q.eq("categories.slug", data.category);
    if (data.brand) q = q.eq("brands.slug", data.brand);
    if (data.q) {
      const term = data.q.replace(/[%,()*\\]/g, " ").trim();
      if (term) q = q.or(`name.ilike.%${term}%,short_description.ilike.%${term}%,model_number.ilike.%${term}%`);
    }
    if (data.filter === "new") q = q.eq("is_new", true);
    if (data.filter === "featured") q = q.eq("is_featured", true);
    if (data.filter === "bestsellers") q = q.eq("is_bestseller", true);
    if (data.filter === "offers") q = q.not("old_price", "is", null);
    if (data.min != null) q = q.gte("price", data.min);
    if (data.max != null && data.max > 0) q = q.lte("price", data.max);
    if (data.instock) q = q.gt("stock", 0);
    const sort = data.sort ?? "newest";
    if (sort === "price-asc") q = q.order("price", { ascending: true });
    else if (sort === "price-desc") q = q.order("price", { ascending: false });
    else if (sort === "bestselling") q = q.order("sales_count", { ascending: false });
    else if (sort === "rating") q = q.order("rating", { ascending: false });
    else q = q.order("created_at", { ascending: false });
    const page = data.page ?? 1;
    q = q.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []).map(toCard), total: count ?? 0, page, pageSize: PAGE_SIZE };
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => z.object({ slug: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const db = publicDb();
    const { data: p, error } = await db
      .from("products")
      .select("*, brand:brands(name, name_en, slug), category:categories(name, slug)")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!p) return null;
    const [reviews, related] = await Promise.all([
      db.from("reviews").select("id, customer_name, rating, comment, created_at").eq("product_id", p.id).eq("is_approved", true).order("created_at", { ascending: false }),
      p.category_id
        ? db.from("products").select(CARD_COLS).eq("is_published", true).eq("category_id", p.category_id).neq("id", p.id).limit(8)
        : Promise.resolve({ data: [], error: null }),
    ]);
    let relatedRows = (related.data ?? []).map(toCard);
    if (relatedRows.length < 4) {
      const more = await db.from("products").select(CARD_COLS).eq("is_published", true).neq("id", p.id).order("sales_count", { ascending: false }).limit(8);
      const seen = new Set(relatedRows.map((r) => r.id));
      relatedRows = [...relatedRows, ...(more.data ?? []).map(toCard).filter((r) => !seen.has(r.id))].slice(0, 8);
    }
    return {
      product: {
        ...p,
        price: Number(p.price),
        old_price: p.old_price == null ? null : Number(p.old_price),
        specs: (Array.isArray(p.specs) ? p.specs : []) as Spec[],
        colors: (Array.isArray(p.colors) ? p.colors : []) as ProductColor[],
        brand: p.brand as { name: string; name_en: string | null; slug: string } | null,
        category: p.category as { name: string; slug: string } | null,
      },
      reviews: reviews.data ?? [],
      related: relatedRows,
    };
  });

export const getProductsByIds = createServerFn({ method: "GET" })
  .inputValidator((d: { ids: string[] }) => z.object({ ids: z.array(z.string().uuid()).max(24) }).parse(d))
  .handler(async ({ data }) => {
    if (data.ids.length === 0) return [];
    const { data: rows, error } = await publicDb()
      .from("products")
      .select(`${CARD_COLS}, specs, warranty, model_number`)
      .in("id", data.ids)
      .eq("is_published", true);
    if (error) throw new Error(error.message);
    const byId = new Map((rows ?? []).map((r) => [r.id, r]));
    return data.ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((r) => ({ ...toCard(r), specs: (Array.isArray(r!.specs) ? r!.specs : []) as Spec[], warranty: r!.warranty, model_number: r!.model_number }));
  });

export const getFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicDb().from("faqs").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});
