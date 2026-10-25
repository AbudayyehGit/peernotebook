import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "navy" | "teal" | "secondary" | "outline" | "ghost" | "destructive" | "warning" | "success" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants: Record<string, string> = {
      default: "bg-[#0F766E] text-white hover:bg-teal-800 shadow-sm",
      teal: "bg-[#0F766E] text-white hover:bg-teal-800 shadow-sm",
      navy: "bg-[#1E3A8A] text-white hover:bg-blue-900 shadow-sm",
      success: "bg-[#16A34A] text-white hover:bg-green-700 shadow-sm",
      warning: "bg-[#D97706] text-white hover:bg-amber-700 shadow-sm",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      link: "text-[#0F766E] underline-offset-4 hover:underline p-0 h-auto min-h-0",
    };

    const sizes: Record<string, string> = {
      default: "h-11 px-5 py-2 text-sm min-h-[44px]",
      sm: "h-11 px-4 py-2 text-xs min-h-[44px]",
      lg: "h-12 px-6 text-sm min-h-[48px]",
      icon: "h-11 w-11 min-h-[44px] min-w-[44px]",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
