import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ThemeVariant = "aurora" | "subtle";

interface Ctx {
  variant: ThemeVariant;
  setVariant: (v: ThemeVariant) => void;
  toggle: () => void;
}

const ThemeVariantContext = createContext<Ctx | undefined>(undefined);

export function ThemeVariantProvider({ children }: { children: ReactNode }) {
  const [variant, setVariantState] = useState<ThemeVariant>(() => {
    if (typeof window === "undefined") return "aurora";
    return (localStorage.getItem("cc-theme-variant") as ThemeVariant) || "aurora";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-subtle", variant === "subtle");
    localStorage.setItem("cc-theme-variant", variant);
  }, [variant]);

  const setVariant = (v: ThemeVariant) => setVariantState(v);
  const toggle = () => setVariantState((v) => (v === "aurora" ? "subtle" : "aurora"));

  return (
    <ThemeVariantContext.Provider value={{ variant, setVariant, toggle }}>
      {children}
    </ThemeVariantContext.Provider>
  );
}

export function useThemeVariant() {
  const ctx = useContext(ThemeVariantContext);
  if (!ctx) throw new Error("useThemeVariant must be used within ThemeVariantProvider");
  return ctx;
}
