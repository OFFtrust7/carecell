import { ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  const cls = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="inline-flex items-center gap-1 text-mint"
            aria-label="Verified donor"
          >
            <ShieldCheck className={cls} />
          </span>
        </TooltipTrigger>
        <TooltipContent className="text-xs">Verified donor — profile complete with donation history</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
