import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, subtitle, crumbs = [] }: { title: ReactNode; subtitle?: ReactNode; crumbs?: { label: string; to?: string }[] }) {
  return (
    <section className="border-b bg-surface/60">
      <div className="container-x py-10 md:py-14">
        <nav aria-label="مسار الصفحة" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">الرئيسية</Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronLeft className="size-3" />
              {c.to ? <Link to={c.to} className="hover:text-foreground">{c.label}</Link> : <span className="text-foreground">{c.label}</span>}
            </span>
          ))}
        </nav>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
    </section>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <span className="inline-flex size-20 items-center justify-center rounded-full bg-surface text-muted-foreground">{icon}</span>
      <h2 className="mt-5 text-lg font-semibold">{title}</h2>
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
