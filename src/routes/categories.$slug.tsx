import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { productListSchema } from "@/lib/catalog.functions";
import { productsQuery, taxonomyQuery } from "@/lib/queries";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductListing } from "@/components/site/ProductListing";

const schema = productListSchema.omit({ category: true });

export const Route = createFileRoute("/categories/$slug")({
  validateSearch: (s) => schema.parse(s),
  loaderDeps: ({ search }) => search,
  loader: async ({ context, params, deps }) => {
    const tax = await context.queryClient.ensureQueryData(taxonomyQuery());
    const cat = tax.categories.find((c) => c.slug === params.slug);
    if (!cat) throw notFound();
    await context.queryClient.ensureQueryData(productsQuery({ ...deps, category: params.slug }));
    return { name: cat.name, description: cat.description };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} – متجر الغيث` : "القسم – متجر الغيث" },
      { name: "description", content: loaderData?.description ?? "تسوق أجهزة هذا القسم من متجر الغيث." },
      { property: "og:title", content: loaderData ? `${loaderData.name} – متجر الغيث` : "متجر الغيث" },
      { property: "og:description", content: loaderData?.description ?? "أجهزة منزلية أصلية بضمان رسمي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { data: tax } = useSuspenseQuery(taxonomyQuery());
  const cat = tax.categories.find((c) => c.slug === slug);
  return (
    <>
      <PageHeader title={cat?.name ?? "القسم"} subtitle={cat?.description} crumbs={[{ label: "الأقسام", to: "/categories" }, { label: cat?.name ?? "" }]} />
      <ProductListing params={search} lockedCategory={slug} />
    </>
  );
}
