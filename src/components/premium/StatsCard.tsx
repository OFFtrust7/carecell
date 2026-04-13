import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  accentColor?: "violet" | "cyan" | "magenta" | "success" | "warning";
  delay?: number;
}

const colorMap = {
  violet: { bg: "bg-glow-violet/10", text: "text-glow-violet", glow: "shadow-[0_0_20px_hsl(var(--glow-violet)_/_0.1)]" },
  cyan: { bg: "bg-glow-cyan/10", text: "text-glow-cyan", glow: "shadow-[0_0_20px_hsl(var(--glow-cyan)_/_0.1)]" },
  magenta: { bg: "bg-glow-magenta/10", text: "text-glow-magenta", glow: "shadow-[0_0_20px_hsl(var(--glow-magenta)_/_0.1)]" },
  success: { bg: "bg-success/10", text: "text-success", glow: "" },
  warning: { bg: "bg-warning/10", text: "text-warning", glow: "" },
};

export default function StatsCard({ icon: Icon, label, value, trend, accentColor = "violet", delay = 0 }: StatsCardProps) {
  const colors = colorMap[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("glass rounded-2xl p-5 hover:bg-[hsl(var(--glass)_/_0.06)] transition-all duration-300", colors.glow)}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.bg)}>
          <Icon className={cn("w-5 h-5", colors.text)} />
        </div>
        {trend && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-display text-foreground mt-3">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </motion.div>
  );
}
