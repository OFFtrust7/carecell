import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface GradientHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  gradient?: boolean;
  className?: string;
  subtitle?: string;
}

export default function GradientHeading({
  children,
  as: Tag = "h1",
  gradient = false,
  className,
  subtitle,
}: GradientHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Tag
        className={cn(
          "font-display tracking-tight",
          Tag === "h1" && "text-3xl sm:text-4xl",
          Tag === "h2" && "text-2xl sm:text-3xl",
          Tag === "h3" && "text-xl sm:text-2xl",
          Tag === "h4" && "text-lg",
          gradient ? "text-gradient" : "text-foreground",
          className
        )}
      >
        {children}
      </Tag>
      {subtitle && (
        <p className="text-muted-foreground mt-2 text-sm sm:text-base">{subtitle}</p>
      )}
    </motion.div>
  );
}
