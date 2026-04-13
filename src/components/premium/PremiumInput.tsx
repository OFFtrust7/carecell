import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, className, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    return (
      <div className="relative">
        <input
          ref={ref}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            setHasValue(e.target.value.length > 0);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
          }}
          className={cn(
            "w-full rounded-xl border border-border bg-[hsl(var(--glass)_/_0.03)] px-4 text-foreground outline-none transition-all duration-300",
            "focus:border-primary/50 focus:ring-1 focus:ring-primary/30 focus:bg-[hsl(var(--glass)_/_0.05)]",
            "placeholder:text-muted-foreground/50",
            label ? "pt-5 pb-2" : "py-2.5",
            "text-sm",
            className
          )}
          placeholder={label ? "" : props.placeholder}
          {...props}
        />
        {label && (
          <label
            className={cn(
              "absolute left-4 transition-all duration-200 pointer-events-none",
              focused || hasValue
                ? "top-1.5 text-[10px] text-accent"
                : "top-3.5 text-sm text-muted-foreground"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
PremiumInput.displayName = "PremiumInput";

export default PremiumInput;
