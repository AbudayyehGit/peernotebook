import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-teal-50 text-teal-800 border-teal-200/60",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "border-slate-300 text-slate-700 bg-white",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    warning: "bg-amber-50 text-amber-800 border-amber-200/60",
    destructive: "bg-red-50 text-red-800 border-red-200/60",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
