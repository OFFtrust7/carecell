import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export default function SkeletonLoader({ lines = 3, className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer rounded-xl h-12"
          style={{ width: `${85 + Math.random() * 15}%`, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
