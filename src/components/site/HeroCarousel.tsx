import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

export function HeroCarousel({ slides }: { slides: Tables<"banners">[] }) {
  const [i, setI] = useState(0);
  const n = slides.length;
  useEffect(() => {
    if (n < 2) return;
    const t = window.setInterval(() => setI((x) => (x + 1) % n), 7000);
    return () => window.clearInterval(t);
  }, [n, i]);
  if (!n) return null;
  const s = slides[i]!;
  return (
    <section className="relative isolate overflow-hidden bg-navy" aria-roledescription="carousel">
      <AnimatePresence mode="sync">
        <motion.img
          key={s.id}
          src={s.image_url}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="animate-kenburns absolute inset-0 -z-10 h-full w-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 -z-10 bg-gradient-to-l from-navy via-navy/70 to-navy/10" />
      <div className="container-x flex min-h-[520px] items-center py-16 md:min-h-[620px]">
        <AnimatePresence mode="wait">
          <motion.div key={s.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6 }} className="max-w-xl text-navy-foreground">
            {s.eyebrow && <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-sm text-gold"><span className="size-1.5 rounded-full bg-gold" />{s.eyebrow}</p>}
            <h1 className="text-4xl font-bold leading-[1.2] md:text-6xl">{s.title}</h1>
            {s.subtitle && <p className="mt-5 text-base leading-8 text-navy-foreground/80 md:text-lg">{s.subtitle}</p>}
            <div className="mt-8 flex flex-wrap gap-3">
              {s.cta_link && (
                <Link to={s.cta_link} className="group inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 font-semibold text-gold-foreground shadow-gold transition hover:scale-[1.02]">
                  {s.cta_label ?? "تسوّق الآن"}<ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
                </Link>
              )}
              <Link to="/products" search={{ filter: "offers" }} className="inline-flex h-12 items-center rounded-full border border-navy-foreground/30 px-7 font-medium text-navy-foreground transition hover:bg-navy-foreground/10">
                شاهد العروض
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {n > 1 && (
        <div className="container-x absolute inset-x-0 bottom-8 flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((sl, idx) => (
              <button key={sl.id} type="button" onClick={() => setI(idx)} aria-label={`الشريحة ${idx + 1}`} className={cn("h-1.5 rounded-full transition-all", idx === i ? "w-10 bg-gold" : "w-5 bg-navy-foreground/40 hover:bg-navy-foreground/70")} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" aria-label="السابق" onClick={() => setI((i - 1 + n) % n)} className="inline-flex size-11 items-center justify-center rounded-full border border-navy-foreground/25 text-navy-foreground hover:bg-navy-foreground/10"><ChevronRight className="size-5" /></button>
            <button type="button" aria-label="التالي" onClick={() => setI((i + 1) % n)} className="inline-flex size-11 items-center justify-center rounded-full border border-navy-foreground/25 text-navy-foreground hover:bg-navy-foreground/10"><ChevronLeft className="size-5" /></button>
          </div>
        </div>
      )}
    </section>
  );
}
