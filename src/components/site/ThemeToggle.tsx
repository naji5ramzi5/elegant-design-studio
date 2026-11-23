import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "الوضع الفاتح" : "الوضع الداكن"}
      title={dark ? "الوضع الفاتح" : "الوضع الداكن"}
      className={cn(
        "relative inline-flex size-10 items-center justify-center rounded-full text-foreground/80 transition hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Sun className={cn("size-[18px] transition-all", dark ? "scale-0 -rotate-90" : "scale-100 rotate-0")} />
      <Moon className={cn("absolute size-[18px] transition-all", dark ? "scale-100 rotate-0" : "scale-0 rotate-90")} />
    </button>
  );
}
