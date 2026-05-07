import { motion } from "framer-motion";

interface AnimatedBackgroundProps {
  variant?: "default" | "subtle" | "hero";
}

export default function AnimatedBackground({ variant = "default" }: AnimatedBackgroundProps) {
  const intense = variant === "hero";
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Base aurora wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_20%,_hsl(var(--glow-aqua)_/_0.18)_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_30%,_hsl(var(--glow-pink)_/_0.16)_0%,_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,_hsl(var(--glow-violet)_/_0.14)_0%,_transparent_60%)]" />
      {variant !== "subtle" && (
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_50%_50%,_hsl(var(--glow-aqua)_/_0.05),_hsl(var(--glow-pink)_/_0.05),_hsl(var(--glow-violet)_/_0.05),_hsl(var(--glow-aqua)_/_0.05))] animate-spin-slow" />
      )}

      {/* Floating aurora blobs */}
      {variant !== "subtle" && (
        <>
          <motion.div
            animate={{ x: [0, 60, -20, 0], y: [0, -40, 30, 0], scale: [1, 1.2, 0.95, 1] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[8%] left-[10%] w-[22rem] h-[22rem] rounded-full bg-[hsl(var(--glow-aqua)_/_0.22)] blur-[90px]"
          />
          <motion.div
            animate={{ x: [0, -50, 30, 0], y: [0, 40, -20, 0], scale: [1, 0.9, 1.15, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[12%] right-[8%] w-[26rem] h-[26rem] rounded-full bg-[hsl(var(--glow-pink)_/_0.18)] blur-[100px]"
          />
          {intense && (
            <motion.div
              animate={{ x: [0, 30, -30, 0], y: [0, -30, 30, 0], scale: [1, 1.1, 0.95, 1] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[40%] right-[35%] w-[20rem] h-[20rem] rounded-full bg-[hsl(var(--glow-violet)_/_0.16)] blur-[110px]"
            />
          )}
        </>
      )}

      {/* Grid overlay */}
      {variant === "hero" && (
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--glow-aqua) / 0.4) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--glow-aqua) / 0.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
          }}
        />
      )}

      {/* Noise texture */}
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
}
