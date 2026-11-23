import { useQuery } from "@tanstack/react-query";
import { productsByIdsQuery } from "@/lib/queries";
import { useRecent } from "@/lib/shop";
import { ProductCard } from "./ProductCard";
import { SectionHeading } from "./SectionHeading";

export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const ids = useRecent().filter((id) => id !== excludeId).slice(0, 4);
  const { data } = useQuery({ ...productsByIdsQuery(ids), enabled: ids.length > 0 });
  if (!ids.length || !data?.length) return null;
  return (
    <section className="container-x mt-20">
      <SectionHeading eyebrow="تابع من حيث توقفت" title="شاهدتها مؤخراً" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">
        {data.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
