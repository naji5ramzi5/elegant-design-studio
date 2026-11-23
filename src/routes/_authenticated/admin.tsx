import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Package, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { formatDateTime, formatIQD, ORDER_STATUS } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم – باسم الغيث" },
      { name: "description", content: "لوحة إدارة متجر باسم الغيث." },
      { property: "og:title", content: "لوحة التحكم – باسم الغيث" },
      { property: "og:description", content: "لوحة إدارة متجر باسم الغيث." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const role = useQuery({
    queryKey: ["admin", "role", user.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      if (error) throw error;
      return data === true;
    },
  });

  const stats = useQuery({
    queryKey: ["admin", "overview"],
    enabled: role.data === true,
    queryFn: async () => {
      const [orders, products] = await Promise.all([
        supabase.from("orders").select("id, order_number, customer_name, city, total, status, created_at").order("created_at", { ascending: false }),
        supabase.from("products").select("id, name, stock"),
      ]);
      if (orders.error) throw orders.error;
      if (products.error) throw products.error;
      const o = orders.data ?? [];
      const p = products.data ?? [];
      return {
        sales: o.filter((x) => x.status !== "cancelled").reduce((s, x) => s + Number(x.total), 0),
        orderCount: o.length,
        pending: o.filter((x) => x.status === "pending").length,
        productCount: p.length,
        lowStock: p.filter((x) => x.stock <= 3),
        latest: o.slice(0, 8),
      };
    },
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", search: {}, replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="font-brand text-2xl text-gold">باسم الغيث</span>
            <span className="text-sm text-muted-foreground">لوحة التحكم</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">عرض المتجر</Link>
            <ThemeToggle />
            <span className="hidden text-xs text-muted-foreground md:inline" dir="ltr">{user.email}</span>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2 rounded-full"><LogOut className="size-4" />خروج</Button>
          </div>
        </div>
      </header>

      <main className="container-x py-8">
        {role.isLoading ? (
          <p className="text-muted-foreground">جارٍ التحقق من الصلاحيات...</p>
        ) : role.data !== true ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
            <h1 className="text-xl font-bold">ليس لديك صلاحية</h1>
            <p className="mt-2 text-sm text-muted-foreground">هذا الحساب لا يملك صلاحية إدارة المتجر.</p>
          </div>
        ) : (
          <div className="space-y-8">
            <h1 className="text-2xl font-bold">نظرة عامة</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi icon={<ShoppingCart className="size-5" />} label="إجمالي المبيعات" value={formatIQD(stats.data?.sales ?? 0)} />
              <Kpi icon={<Package className="size-5" />} label="عدد الطلبات" value={String(stats.data?.orderCount ?? 0)} />
              <Kpi icon={<Clock className="size-5" />} label="قيد المراجعة" value={String(stats.data?.pending ?? 0)} />
              <Kpi icon={<AlertTriangle className="size-5" />} label="منخفض المخزون" value={String(stats.data?.lowStock.length ?? 0)} />
            </div>
            <section className="rounded-2xl border bg-card shadow-soft">
              <h2 className="border-b p-5 font-semibold">أحدث الطلبات</h2>
              {stats.data && stats.data.latest.length === 0 ? (
                <p className="p-5 text-sm text-muted-foreground">لا توجد طلبات بعد.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-muted-foreground">
                      <tr className="border-b text-start">
                        <th className="p-4 text-start font-medium">رقم الطلب</th>
                        <th className="p-4 text-start font-medium">العميل</th>
                        <th className="p-4 text-start font-medium">المدينة</th>
                        <th className="p-4 text-start font-medium">المجموع</th>
                        <th className="p-4 text-start font-medium">الحالة</th>
                        <th className="p-4 text-start font-medium">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.data?.latest.map((o) => (
                        <tr key={o.id} className="border-b last:border-0">
                          <td className="num p-4 font-medium">{o.order_number}</td>
                          <td className="p-4">{o.customer_name}</td>
                          <td className="p-4">{o.city}</td>
                          <td className="p-4">{formatIQD(o.total)}</td>
                          <td className="p-4">
                            <span className={`rounded-full border px-2.5 py-1 text-xs ${ORDER_STATUS[o.status]?.tone ?? ""}`}>{ORDER_STATUS[o.status]?.label ?? o.status}</span>
                          </td>
                          <td className="p-4 text-muted-foreground">{formatDateTime(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function Kpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-gold/15 text-gold">{icon}</span>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
