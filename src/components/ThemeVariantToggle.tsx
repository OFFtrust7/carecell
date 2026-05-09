import { Sparkles, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeVariant } from "@/hooks/useThemeVariant";

export default function ThemeVariantToggle() {
  const { variant, toggle } = useThemeVariant();
  const subtle = variant === "subtle";
  return (
    <button
      onClick={toggle}
      title={subtle ? "Switch to full Aurora" : "Switch to Subtle Aurora"}
      aria-label="Toggle visual variant"
      className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.06)] transition-all"
    >
      <motion.div
        key={variant}
        initial={{ rotate: -30, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {subtle ? <Moon className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary" />}
      </motion.div>
    </button>
  );
}
