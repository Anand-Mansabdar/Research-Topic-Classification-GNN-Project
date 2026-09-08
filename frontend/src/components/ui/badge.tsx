import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium leading-none rounded-full border",
  {
    variants: {
      variant: {
        default: "bg-brick-600 text-white border-brick-600",
        outline: "bg-transparent text-black border-black/25",
        muted: "bg-brick-100 text-brick-900 border-brick-200",
        dark: "bg-black text-white border-black",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} style={style} {...props} />;
}

export { Badge, badgeVariants };
