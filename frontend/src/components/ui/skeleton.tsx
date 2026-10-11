import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-primary/8 via-primary/12 to-primary/8 bg-[length:200%_100%]",
        className
      )}
      style={{
        animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite, shimmer 1.8s ease-in-out infinite",
      }}
      {...props}
    />
  );
}

export { Skeleton };
