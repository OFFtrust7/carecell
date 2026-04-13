import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  children: React.ReactNode;
}

const GlowButton = forwardRef<HTMLButtonElement, GlowButtonProps>(
  ({ variant = "primary", size = "md", glow = true, className, children, ...props }, ref) => {
    const variants = {
      primary:
        "bg-gradient-to-r from-glow-violet to-glow-cyan text-white hover:shadow-[0_0_35px_hsl(var(--glow-violet)_/_0.35)] active:scale-[0.98]",
      secondary:
        "glass text-foreground hover:bg-[hsl(var(--glass)_/_0.08)] active:scale-[0.98]",
      ghost:
        "bg-transparent text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--glass)_/_0.05)]",
      danger:
        "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
      md: "px-5 py-2.5 text-sm rounded-xl gap-2",
      lg: "px-8 py-3.5 text-base rounded-xl gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-[1.02]",
          variants[variant],
          sizes[size],
          glow && variant === "primary" && "shadow-[0_0_25px_hsl(var(--glow-violet)_/_0.2)]",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
GlowButton.displayName = "GlowButton";

export default GlowButton;
