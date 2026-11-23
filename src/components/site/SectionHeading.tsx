import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, to, search, action = "عرض الكل" }: { eyebrow?: string; title: ReactNode; to?: string; search?: Record<string, string>; action?: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-sm font-medium text-gold">{eyebrow}</p>}
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
      </div>
      {to && (
        <Link to={to} search={search} className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          {action}
          <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}
