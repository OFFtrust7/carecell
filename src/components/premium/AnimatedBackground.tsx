import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "default" | "subtle" | "hero";
}

export default function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base aurora */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,_hsl(271_76%_53%_/_0.1)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,_hsl(181_100%_41%_/_0.06)_0%,_transparent_50%)]" />
      {variant !== "subtle" && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_hsl(291_64%_62%_/_0.04)_0%,_transparent_40%)]" />
      )}

      {/* Floating orbs */}
      {variant !== "subtle" && (
        <>
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[15%] w-64 h-64 rounded-full bg-[hsl(271_76%_53%_/_0.05)] blur-[80px]"
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 30, 0], scale: [1, 0.9, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[10%] w-72 h-72 rounded-full bg-[hsl(181_100%_41%_/_0.04)] blur-[80px]"
          />
        </>
      )}

      {/* Grid overlay */}
      {variant === "hero" && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground) / 0.1) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground) / 0.1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      )}

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
}
