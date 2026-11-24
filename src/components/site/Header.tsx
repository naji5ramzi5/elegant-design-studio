import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { GitCompareArrows, Heart, Menu, Phone, Search, ShoppingBag, Truck, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { settingsQuery, taxonomyQuery } from "@/lib/queries";
import { useCartPulse, useCompare, useWishlist } from "@/lib/shop";
import { formatIQD } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { CartSheet, useCartTotals } from "./CartSheet";

const NAV = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "كل المنتجات" },
  { to: "/categories", label: "الأقسام" },
  { to: "/products", search: { filter: "offers" }, label: "العروض" },
  { to: "/track", label: "تتبع الطلب" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
] as const;

function IconBadge({ count, pulse }: { count: number; pulse?: number }) {
  if (count <= 0) return null;
  return (
    <span key={pulse} className="num absolute -end-0.5 -top-0.5 inline-flex min-w-[18px] animate-bump items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold leading-[18px] text-gold-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function SearchBox({ className, autoFocus, onDone }: { className?: string; autoFocus?: boolean; onDone?: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        navigate({ to: "/products", search: q.trim() ? { q: q.trim() } : {} });
        onDone?.();
      }}
    >
      <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ابحث عن ثلاجة، غسالة، مكيف..."
        aria-label="بحث في المنتجات"
        className="h-11 w-full rounded-full border bg-surface ps-11 pe-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card focus:ring-2 focus:ring-ring/20"
      />
    </form>
  );
}

export function Header() {
  const { data: settings } = useQuery(settingsQuery());
  const { data: tax } = useQuery(taxonomyQuery());
  const wish = useWishlist();
  const compare = useCompare();
  const pulse = useCartPulse();
  const { count } = useCartTotals();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const first = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (pulse > first.current) setCartOpen(true);
    first.current = pulse;
  }, [pulse]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setCartOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="bg-navy text-navy-foreground">
        <div className="container-x flex h-9 items-center justify-between gap-4 text-xs">
          <p className="flex min-w-0 items-center gap-2">
            <Truck className="size-3.5 shrink-0 text-gold" />
            <span className="truncate">
              <span className="hidden sm:inline">توصيل لجميع محافظات العراق — </span>
              توصيل مجاني للطلبات فوق {formatIQD(settings?.free_delivery_threshold ?? 500000)}
            </span>
          </p>
          <a href={`tel:${settings?.phone ?? "07886443032"}`} className="hidden items-center gap-1.5 hover:text-gold sm:flex">
            <Phone className="size-3.5" />
            <span className="num">{settings?.phone ?? "07886443032"}</span>
          </a>
        </div>
      </div>
      <header className={cn("sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl transition-shadow", scrolled && "shadow-soft")}>
        <div className="container-x flex h-16 items-center gap-1.5 sm:h-[72px] sm:gap-3 lg:gap-8">
          <button type="button" onClick={() => setMenuOpen(true)} aria-label="القائمة" className="-ms-2 inline-flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-muted lg:hidden">
            <Menu className="size-5" />
          </button>
          <Logo className="min-w-0" />
          <SearchBox className="mx-auto hidden max-w-xl flex-1 md:block" />
          <div className="ms-auto flex shrink-0 items-center md:ms-0 md:gap-0.5">
            <button type="button" onClick={() => setSearchOpen((v) => !v)} aria-label="بحث" className="inline-flex size-9 sm:size-10 items-center justify-center rounded-full hover:bg-muted md:hidden">
              {searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
            </button>
            <ThemeToggle />
            <Link to="/compare" aria-label="المقارنة" className="relative hidden size-10 items-center justify-center rounded-full hover:bg-muted sm:inline-flex">
              <GitCompareArrows className="size-[18px]" />
              <IconBadge count={compare.length} />
            </Link>
            <Link to="/wishlist" aria-label="المفضلة" className="relative hidden size-10 min-[400px]:inline-flex items-center justify-center rounded-full hover:bg-muted">
              <Heart className="size-[18px]" />
              <IconBadge count={wish.length} />
            </Link>
            <button type="button" onClick={() => setCartOpen(true)} aria-label="السلة" className="relative inline-flex size-9 sm:size-10 items-center justify-center rounded-full hover:bg-muted">
              <ShoppingBag className="size-[18px]" />
              <IconBadge count={count} pulse={pulse} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="container-x pb-3 md:hidden">
            <SearchBox autoFocus onDone={() => setSearchOpen(false)} />
          </div>
        )}
        <nav aria-label="الأقسام" className="hidden border-t lg:block">
          <div className="container-x no-scrollbar flex h-12 items-center gap-1 overflow-x-auto text-sm">
            {NAV.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                {...("search" in n ? { search: n.search } : {})}
                activeOptions={{ exact: true, includeSearch: true }}
                className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-foreground/75 transition hover:bg-muted hover:text-foreground data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
              >
                {n.label}
              </Link>
            ))}
            <span className="mx-2 h-5 w-px bg-border" />
            {tax?.categories.slice(0, 5).map((c) => (
              <Link key={c.id} to="/categories/$slug" params={{ slug: c.slug }} className="whitespace-nowrap rounded-full px-3 py-1.5 text-muted-foreground transition hover:text-foreground data-[status=active]:text-gold">
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-[85vw] max-w-sm overflow-y-auto p-0">
          <SheetHeader className="border-b p-5 text-start">
            <SheetTitle><Logo /></SheetTitle>
          </SheetHeader>
          <div className="space-y-6 p-5">
            <SearchBox />
            <nav className="grid gap-1">
              {NAV.map((n) => (
                <Link key={n.label} to={n.to} {...("search" in n ? { search: n.search } : {})} className="rounded-xl px-3 py-2.5 font-medium hover:bg-muted">{n.label}</Link>
              ))}
              <Link to="/wishlist" className="rounded-xl px-3 py-2.5 font-medium hover:bg-muted">المفضلة</Link>
              <Link to="/compare" className="rounded-xl px-3 py-2.5 font-medium hover:bg-muted">المقارنة</Link>
              <Link to="/faq" className="rounded-xl px-3 py-2.5 font-medium hover:bg-muted">الأسئلة الشائعة</Link>
            </nav>
            <div>
              <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">الأقسام</p>
              <div className="grid gap-1">
                {tax?.categories.map((c) => (
                  <Link key={c.id} to="/categories/$slug" params={{ slug: c.slug }} className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted">
                    {c.image_url && <img src={c.image_url} alt="" className="size-9 rounded-lg bg-surface object-cover" />}
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
