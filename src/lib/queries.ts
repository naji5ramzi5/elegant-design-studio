import { queryOptions } from "@tanstack/react-query";
import {
  getFaqs,
  getHomeData,
  getProduct,
  getProductsByIds,
  getStoreSettings,
  getTaxonomy,
  listProducts,
  type ProductListParams,
} from "./catalog.functions";

const MIN = 60_000;

export const settingsQuery = () =>
  queryOptions({ queryKey: ["settings"], queryFn: () => getStoreSettings(), staleTime: 5 * MIN });
export const homeQuery = () =>
  queryOptions({ queryKey: ["home"], queryFn: () => getHomeData(), staleTime: MIN });
export const taxonomyQuery = () =>
  queryOptions({ queryKey: ["taxonomy"], queryFn: () => getTaxonomy(), staleTime: 5 * MIN });
export function cleanListParams(p: ProductListParams): ProductListParams {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== "" && v !== false) out[k] = v;
  return out as ProductListParams;
}

export const productsQuery = (params: ProductListParams) => {
  const p = cleanListParams(params);
  return queryOptions({ queryKey: ["products", p], queryFn: () => listProducts({ data: p }), staleTime: MIN });
};
export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => getProduct({ data: { slug } }), staleTime: MIN });
export const productsByIdsQuery = (ids: string[]) =>
  queryOptions({ queryKey: ["products-by-ids", ids], queryFn: () => getProductsByIds({ data: { ids } }), staleTime: MIN });
export const faqsQuery = () =>
  queryOptions({ queryKey: ["faqs"], queryFn: () => getFaqs(), staleTime: 5 * MIN });
