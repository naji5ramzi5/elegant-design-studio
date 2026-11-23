import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/logo-mark.png";

export function Logo({ className, tone = "default" }: { className?: string; tone?: "default" | "light" }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="متجر الغيث – الرئيسية">
      <img src={logoMark} alt="" width={40} height={40} className="size-10 object-contain drop-shadow-sm transition group-hover:scale-105" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-brand text-2xl", tone === "light" ? "text-navy-foreground" : "text-foreground")}>متجر الغيث</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.25em] text-gold" dir="ltr">Premium Home</span>
      </span>
    </Link>
  );
}
