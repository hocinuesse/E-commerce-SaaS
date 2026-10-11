import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/85 hover:shadow-md hover:-translate-y-0.5",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:-translate-y-0.5",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/85",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200 hover:-translate-y-0.5",
        warning:
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200 hover:-translate-y-0.5",
        info:
          "border-transparent bg-teal-100 text-teal-700 hover:bg-teal-200 hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
