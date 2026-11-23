import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { taxonomyQuery } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";

export const Route = createFileRoute("/categories/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(taxonomyQuery()),
  head: () => ({
    meta: [
      { title: "الأقسام – متجر الغيث" },
      { name: "description", content: "تسوق حسب القسم: ثلاجات، غسالات، مكيفات، شاشات، أفران، مكانس وأجهزة مطبخ." },
      { property: "og:title", content: "أقسام متجر متجر الغيث" },
      { property: "og:description", content: "كل أقسام الأجهزة المنزلية في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data } = useSuspenseQuery(taxonomyQuery());
  return (
    <>
      <PageHeader title="الأقسام" subtitle="اختر القسم الذي يناسب احتياجات منزلك." crumbs={[{ label: "الأقسام" }]} />
      <div className="container-x grid grid-cols-2 gap-4 py-12 md:grid-cols-3 lg:grid-cols-3">
        {data.categories.map((c) => (
          <Link key={c.id} to="/categories/$slug" params={{ slug: c.slug }} className="group relative overflow-hidden rounded-3xl border bg-card shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
            <div className="aspect-[4/3] overflow-hidden bg-surface">
              {c.image_url && <img src={c.image_url} alt={c.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
            </div>
            <div className="flex items-center justify-between gap-3 p-5">
              <div>
                <h2 className="font-semibold md:text-lg">{c.name}</h2>
                {c.description && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{c.description}</p>}
              </div>
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-surface transition group-hover:bg-gold group-hover:text-gold-foreground"><ArrowLeft className="size-4" /></span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
