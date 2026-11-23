import { useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PackageSearch, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cleanListParams, productsQuery, taxonomyQuery } from "@/lib/queries";
import type { ProductListParams } from "@/lib/catalog.functions";
import { formatIQD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "./PageHeader";

const SORT_LABELS: Record<string, string> = {
  newest: "الأحدث",
  bestselling: "الأكثر مبيعاً",
  "price-asc": "السعر: من الأقل",
  "price-desc": "السعر: من الأعلى",
  rating: "الأعلى تقييماً",
};
const FILTER_LABELS: Record<string, string> = { offers: "العروض", new: "وصل حديثاً", bestsellers: "الأكثر مبيعاً", featured: "مميز" };
const PRICE_RANGES = [
  { label: "أقل من 250,000", min: undefined, max: 250000 },
  { label: "250,000 – 750,000", min: 250000, max: 750000 },
  { label: "750,000 – 1,500,000", min: 750000, max: 1500000 },
  { label: "أكثر من 1,500,000", min: 1500000, max: undefined },
];

type Props = { params: ProductListParams; lockedCategory?: string };

const clean = cleanListParams;

export function ProductListing({ params, lockedCategory }: Props) {
  const navigate = useNavigate();
  const effective = lockedCategory ? { ...params, category: lockedCategory } : params;
  const { data } = useSuspenseQuery(productsQuery(clean(effective)));
  const { data: tax } = useSuspenseQuery(taxonomyQuery());
  const [open, setOpen] = useState(false);

  const update = (patch: Partial<ProductListParams>) => {
    const next = clean({ ...params, page: undefined, ...patch });
    if (lockedCategory) navigate({ to: "/categories/$slug", params: { slug: lockedCategory }, search: next, resetScroll: false });
    else navigate({ to: "/products", search: next, resetScroll: false });
    setOpen(false);
  };

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const active: { label: string; clear: Partial<ProductListParams> }[] = [];
  if (params.q) active.push({ label: `بحث: ${params.q}`, clear: { q: undefined } });
  if (!lockedCategory && params.category) active.push({ label: tax.categories.find((c) => c.slug === params.category)?.name ?? params.category, clear: { category: undefined } });
  if (params.brand) active.push({ label: tax.brands.find((b) => b.slug === params.brand)?.name ?? params.brand, clear: { brand: undefined } });
  if (params.filter) active.push({ label: FILTER_LABELS[params.filter] ?? params.filter, clear: { filter: undefined } });
  if (params.min != null || params.max != null) active.push({ label: `السعر ${params.min ? formatIQD(params.min) : "0"} – ${params.max ? formatIQD(params.max) : "∞"}`, clear: { min: undefined, max: undefined } });
  if (params.instock) active.push({ label: "المتوفر فقط", clear: { instock: undefined } });

  const filters = (
    <div className="space-y-8">
      {!lockedCategory && (
        <FilterGroup title="الأقسام">
          <Chip active={!params.category} onClick={() => update({ category: undefined })}>الكل</Chip>
          {tax.categories.map((c) => (
            <Chip key={c.id} active={params.category === c.slug} onClick={() => update({ category: c.slug })}>{c.name}</Chip>
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="الماركات">
        <Chip active={!params.brand} onClick={() => update({ brand: undefined })}>الكل</Chip>
        {tax.brands.map((b) => (
          <Chip key={b.id} active={params.brand === b.slug} onClick={() => update({ brand: b.slug })}>{b.name}</Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="السعر (د.ع)">
        {PRICE_RANGES.map((r) => (
          <Chip key={r.label} active={params.min === r.min && params.max === r.max} onClick={() => update({ min: r.min, max: r.max })}>{r.label}</Chip>
        ))}
      </FilterGroup>
      <FilterGroup title="تصفية">
        {Object.entries(FILTER_LABELS).map(([k, v]) => (
          <Chip key={k} active={params.filter === k} onClick={() => update({ filter: params.filter === k ? undefined : (k as ProductListParams["filter"]) })}>{v}</Chip>
        ))}
      </FilterGroup>
      <label className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
        المتوفر في المخزون فقط
        <Switch checked={!!params.instock} onCheckedChange={(v) => update({ instock: v || undefined })} />
      </label>
    </div>
  );

  return (
    <div className="container-x py-10">
      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36">{filters}</div>
        </aside>
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground"><span className="num font-semibold text-foreground">{data.total}</span> منتج</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2 rounded-full lg:hidden" onClick={() => setOpen(true)}>
                <SlidersHorizontal className="size-4" />تصفية
              </Button>
              <Select value={params.sort ?? "newest"} onValueChange={(v) => update({ sort: v as ProductListParams["sort"] })}>
                <SelectTrigger className="w-44 rounded-full" aria-label="ترتيب حسب"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SORT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          {active.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {active.map((a) => (
                <button key={a.label} type="button" onClick={() => update(a.clear)} className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium">
                  {a.label}<X className="size-3" />
                </button>
              ))}
            </div>
          )}
          {data.items.length === 0 ? (
            <EmptyState icon={<PackageSearch className="size-8" />} title="لا توجد منتجات مطابقة" text="جرّب تغيير خيارات التصفية أو البحث بكلمة أخرى." action={<Button className="rounded-full" onClick={() => (lockedCategory ? update({ q: undefined, brand: undefined, filter: undefined, min: undefined, max: undefined, instock: undefined }) : navigate({ to: "/products" }))}>مسح التصفية</Button>} />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
          {pages > 1 && (
            <nav aria-label="الصفحات" className="mt-10 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    const next = clean({ ...params, page: n === 1 ? undefined : n });
                    if (lockedCategory) navigate({ to: "/categories/$slug", params: { slug: lockedCategory }, search: next });
                    else navigate({ to: "/products", search: next });
                  }}
                  className={cn("num size-10 rounded-full border text-sm", n === data.page ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}
                >
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto">
          <SheetHeader className="text-start"><SheetTitle>تصفية المنتجات</SheetTitle></SheetHeader>
          <div className="mt-6">{filters}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn("rounded-full border px-3 py-1.5 text-xs transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-foreground/30")}>
      {children}
    </button>
  );
}

