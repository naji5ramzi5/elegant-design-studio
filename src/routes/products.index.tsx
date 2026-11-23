import { createFileRoute } from "@tanstack/react-router";
import { productListSchema } from "@/lib/catalog.functions";
import { productsQuery, taxonomyQuery } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductListing } from "@/components/site/ProductListing";

export const Route = createFileRoute("/products/")({
  validateSearch: (s) => productListSchema.parse(s),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery(deps)),
      context.queryClient.ensureQueryData(taxonomyQuery()),
    ]);
  },
  head: () => ({
    meta: [
      { title: "كل المنتجات – متجر الغيث" },
      { name: "description", content: "تصفح ثلاجات وغسالات ومكيفات وشاشات وأجهزة مطبخ من أشهر الماركات بأسعار بالدينار العراقي." },
      { property: "og:title", content: "كل المنتجات – متجر الغيث" },
      { property: "og:description", content: "أجهزة منزلية أصلية بضمان رسمي وتوصيل لكل العراق." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const search = Route.useSearch();
  const title = search.filter === "offers" ? "العروض والخصومات" : search.filter === "new" ? "وصل حديثاً" : search.q ? `نتائج البحث عن "${search.q}"` : "كل المنتجات";
  return (
    <>
      <PageHeader title={title} subtitle="أجهزة أصلية بضمان رسمي، توصيل لجميع المحافظات والدفع عند الاستلام." crumbs={[{ label: "المنتجات" }]} />
      <ProductListing params={search} />
    </>
  );
}
