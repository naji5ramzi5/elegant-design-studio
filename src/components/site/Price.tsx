import { formatIQD } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({ price, oldPrice, size = "md", className }: { price: number; oldPrice?: number | null; size?: "sm" | "md" | "lg"; className?: string }) {
  const hasOld = oldPrice != null && oldPrice > price;
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("whitespace-nowrap font-bold text-foreground", size === "lg" ? "text-3xl" : size === "md" ? "text-lg" : "text-[15px] sm:text-base")}>
        {formatIQD(price)}
      </span>
      {hasOld && (
        <span className={cn("whitespace-nowrap text-muted-foreground line-through decoration-destructive/60", size === "lg" ? "text-lg" : size === "md" ? "text-sm" : "text-xs sm:text-sm")}>
          {formatIQD(oldPrice)}
        </span>
      )}
    </div>
  );
}
