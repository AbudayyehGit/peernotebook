import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "navy" | "teal" | "secondary" | "outline" | "success" | "warning" | "destructive";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants: Record<string, string> = {
    default: "bg-teal-50 text-[#0F766E] border-teal-200",
    teal: "bg-teal-50 text-[#0F766E] border-teal-200",
    navy: "bg-blue-50 text-[#1E3A8A] border-blue-200",
    secondary: "bg-slate-100 text-slate-700 border-slate-200",
    outline: "border-slate-300 text-slate-700 bg-white",
    success: "bg-emerald-50 text-[#16A34A] border-emerald-200",
    warning: "bg-amber-50 text-[#D97706] border-amber-200",
    destructive: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
