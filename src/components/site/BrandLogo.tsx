import samsung from "@/assets/brands/samsung.svg?url";
import lg from "@/assets/brands/lg.svg?url";
import bosch from "@/assets/brands/bosch.svg?url";
import philips from "@/assets/brands/philips.svg?url";
import dyson from "@/assets/brands/dyson.svg?url";
import delonghi from "@/assets/brands/delonghi.svg?url";
import kenwood from "@/assets/brands/kenwood.svg?url";
import beko from "@/assets/brands/beko.svg?url";
import xiaomi from "@/assets/brands/xiaomi.svg?url";
import { cn } from "@/lib/utils";

/** Logo file + a height multiplier so wide wordmarks and square marks look balanced. */
const LOGOS: Record<string, { src: string; scale: number }> = {
  samsung: { src: samsung, scale: 0.55 },
  lg: { src: lg, scale: 1.05 },
  bosch: { src: bosch, scale: 1.25 },
  philips: { src: philips, scale: 0.7 },
  dyson: { src: dyson, scale: 1 },
  delonghi: { src: delonghi, scale: 0.9 },
  kenwood: { src: kenwood, scale: 0.6 },
  beko: { src: beko, scale: 0.65 },
  xiaomi: { src: xiaomi, scale: 1.25 },
};

/** Single-colour brand mark that follows the current text colour (works in light and dark mode). */
export function BrandLogo({ slug, name, height = 28, className }: { slug: string; name: string; height?: number; className?: string }) {
  const logo = LOGOS[slug];
  if (!logo) return <span className={cn("text-sm font-bold tracking-widest", className)} dir="ltr">{name.toUpperCase()}</span>;
  const h = Math.round(height * logo.scale);
  return (
    <span role="img" aria-label={name} className={cn("block bg-current", className)} style={{ height: h, width: "100%", maxWidth: 150, maskImage: `url("${logo.src}")`, WebkitMaskImage: `url("${logo.src}")`, maskRepeat: "no-repeat", WebkitMaskRepeat: "no-repeat", maskPosition: "center", WebkitMaskPosition: "center", maskSize: "contain", WebkitMaskSize: "contain" }} />
  );
}
