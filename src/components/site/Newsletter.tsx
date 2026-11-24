import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().trim().email().max(160).safeParse(email);
    if (!parsed.success) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: parsed.data.toLowerCase() });
    setBusy(false);
    if (error && error.code !== "23505") {
      toast.error("تعذر الاشتراك، حاول مجدداً");
      return;
    }
    setEmail("");
    toast.success("تم اشتراكك بنجاح", { description: "سنرسل لك أحدث العروض أولاً بأول." });
  }
  return (
    <form onSubmit={submit} className={className}>
      <div className="flex items-center gap-2 rounded-full border border-navy-foreground/15 bg-navy-foreground/5 p-1.5 ps-5 focus-within:border-gold">
        <input
          type="email"
          dir="ltr"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label="البريد الإلكتروني"
          className="min-w-0 flex-1 bg-transparent text-end text-sm text-navy-foreground outline-none placeholder:text-navy-foreground/40"
        />
        <button type="submit" disabled={busy} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-gold px-4 text-sm font-semibold sm:px-5 text-gold-foreground transition hover:shadow-gold disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          اشترك
        </button>
      </div>
    </form>
  );
}
