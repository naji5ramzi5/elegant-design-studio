export function formatIQD(value: number | string | null | undefined): string {
  const n = Math.round(Number(value ?? 0));
  return `${n.toLocaleString("en-US")} د.ع`;
}

export function discountPercent(price: number, oldPrice?: number | null): number {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export const IRAQI_CITIES = [
  "بغداد", "البصرة", "نينوى (الموصل)", "أربيل", "النجف", "كربلاء", "السليمانية", "دهوك",
  "كركوك", "الأنبار", "بابل (الحلة)", "ديالى", "ذي قار (الناصرية)", "واسط (الكوت)",
  "صلاح الدين", "القادسية (الديوانية)", "ميسان (العمارة)", "المثنى (السماوة)", "حلبجة",
] as const;

export const ORDER_STATUS: Record<string, { label: string; tone: string }> = {
  pending: { label: "قيد المراجعة", tone: "bg-gold/15 text-foreground border-gold/40" },
  confirmed: { label: "تم التأكيد", tone: "bg-chart-1/15 text-foreground border-chart-1/40" },
  shipped: { label: "قيد الشحن", tone: "bg-chart-4/15 text-foreground border-chart-4/40" },
  delivered: { label: "تم التوصيل", tone: "bg-success/15 text-foreground border-success/40" },
  cancelled: { label: "ملغي", tone: "bg-destructive/15 text-foreground border-destructive/40" },
};

export const PAYMENT_LABELS: Record<string, string> = {
  cod: "الدفع عند الاستلام",
  bank_transfer: "تحويل بنكي",
  online: "دفع إلكتروني",
};

export function whatsappLink(number: string, text?: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
