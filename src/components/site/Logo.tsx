import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "light" }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="متجر الغيث – الرئيسية">
      <img src={logoMark} alt="" width={40} height={40} className="size-9 shrink-0 object-contain sm:size-10 drop-shadow-sm transition group-hover:scale-105" />
      <span className="flex min-w-0 flex-col whitespace-nowrap leading-none">
        <span className={cn("font-brand text-lg font-extrabold tracking-tight sm:text-xl", tone === "light" ? "text-navy-foreground" : "text-foreground")}>متجر الغيث</span>
        <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-gold sm:text-[10px] sm:tracking-[0.25em]" dir="ltr">Premium Home</span>
      </span>
    </Link>
  );
}
