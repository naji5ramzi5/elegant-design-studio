import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const schema = z.object({
  customer_name: z.string().trim().min(2, "يرجى كتابة اسمك").max(60),
  rating: z.number().int().min(1, "اختر عدد النجوم").max(5),
  comment: z.string().trim().min(5, "اكتب تعليقاً قصيراً").max(800),
});

export function ReviewForm({ productId }: { productId: string }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ customer_name: name, rating, comment });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "تحقق من البيانات");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("reviews").insert({ ...parsed.data, product_id: productId, is_approved: false });
    setBusy(false);
    if (error) {
      toast.error("تعذر إرسال التقييم");
      return;
    }
    setSent(true);
    toast.success("شكراً لتقييمك", { description: "سيظهر بعد مراجعته من فريقنا." });
  }

  if (sent) return <p className="rounded-2xl bg-surface p-5 text-sm">شكراً لك! سيظهر تقييمك بعد المراجعة.</p>;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border bg-card p-5">
      <h3 className="font-semibold">أضف تقييمك</h3>
      <div className="flex gap-1" role="radiogroup" aria-label="التقييم">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={rating === i} aria-label={`${i} نجوم`} onClick={() => setRating(i)}>
            <Star className={cn("size-7 transition", i <= rating ? "fill-gold text-gold" : "text-muted-foreground/40")} />
          </button>
        ))}
      </div>
      <Input placeholder="اسمك" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
      <Textarea placeholder="شاركنا تجربتك مع المنتج" value={comment} onChange={(e) => setComment(e.target.value)} className="min-h-24 rounded-xl" />
      <Button type="submit" disabled={busy} className="rounded-full">{busy && <Loader2 className="size-4 animate-spin" />}إرسال التقييم</Button>
    </form>
  );
}
