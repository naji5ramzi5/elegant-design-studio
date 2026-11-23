import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/site/ThemeToggle";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "تسجيل الدخول – لوحة تحكم باسم الغيث" },
      { name: "description", content: "دخول فريق إدارة متجر باسم الغيث إلى لوحة التحكم." },
      { property: "og:title", content: "تسجيل الدخول – باسم الغيث" },
      { property: "og:description", content: "دخول فريق إدارة متجر باسم الغيث." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function safePath(p?: string) {
  if (!p) return "/admin";
  try {
    const u = new URL(p, window.location.origin);
    if (u.origin !== window.location.origin) return "/admin";
    return u.pathname + u.search;
  } catch {
    return "/admin";
  }
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: safePath(redirect) });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((e, session) => {
      if (e === "SIGNED_IN" && session) navigate({ to: safePath(redirect) });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, redirect]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب", { description: "تحقق من بريدك الإلكتروني لتأكيد الحساب." });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(msg.includes("Invalid login") ? "البريد أو كلمة المرور غير صحيحة" : msg);
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/auth` });
    if (res && "error" in res && res.error) toast.error("تعذر تسجيل الدخول عبر Google");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <img src="/images/hero/living.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-navy-foreground">
          <p className="font-brand text-5xl text-gold">باسم الغيث</p>
          <p className="mt-4 max-w-md text-lg text-navy-foreground/80">لوحة إدارة المتجر — المنتجات والطلبات والعروض في مكان واحد.</p>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-5">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← العودة للمتجر</Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-sm">
            <div className="mb-8">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-gold/15 text-gold"><ShieldCheck className="size-6" /></span>
              <h1 className="mt-5 text-3xl font-bold">{mode === "in" ? "تسجيل الدخول" : "إنشاء حساب"}</h1>
              <p className="mt-2 text-sm text-muted-foreground">للإدارة فقط. أول حساب يُنشأ يصبح مدير المتجر.</p>
            </div>
            <Button type="button" variant="outline" className="h-12 w-full gap-3 rounded-xl" onClick={google}>
              <svg viewBox="0 0 24 24" className="size-5" aria-hidden><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h6c-.3 1.4-1 2.5-2.2 3.3v2.8h3.6c2-1.9 3.2-4.7 3.2-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9C3.9 20.6 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2.1C1.4 8.5 1 10.2 1 12s.4 3.5 1.1 5l3.7-2.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2.1 15 1 12 1 7.7 1 3.9 3.4 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>
              المتابعة عبر Google
            </Button>
            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />أو بالبريد الإلكتروني<span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input id="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input id="password" type="password" dir="ltr" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
              </div>
              <Button type="submit" disabled={busy} className="h-12 w-full rounded-xl text-base">
                {busy && <Loader2 className="size-4 animate-spin" />}
                {mode === "in" ? "دخول" : "إنشاء الحساب"}
              </Button>
            </form>
            <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground">
              {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
