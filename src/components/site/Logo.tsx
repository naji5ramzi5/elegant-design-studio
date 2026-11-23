import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "light" }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="باسم الغيث – الرئيسية">
      <span className="relative inline-flex size-10 items-center justify-center rounded-xl bg-navy text-gold shadow-soft ring-1 ring-gold/30 dark:bg-gold dark:text-gold-foreground">
        <span className="font-brand text-2xl leading-none">ب</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-brand text-2xl", tone === "light" ? "text-navy-foreground" : "text-foreground")}>باسم الغيث</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-gold" dir="ltr">Premium Home</span>
      </span>
    </Link>
  );
}
