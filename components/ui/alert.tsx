import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "soft";
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses =
      variant === "destructive"
        ? "border-destructive/40 bg-destructive/5 text-destructive"
        : variant === "soft"
        ? "border-warm-200 bg-warm-50 text-warm-900"
        : "border-border bg-muted/40 text-foreground";

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative w-full rounded-lg border px-3 py-2 text-xs md:text-sm",
          variantClasses,
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

