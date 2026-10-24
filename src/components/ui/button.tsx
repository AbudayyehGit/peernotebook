import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variants: Record<string, string> = {
      default: "bg-teal-700 text-white hover:bg-teal-800 shadow-sm",
      secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/60",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900",
      ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
      destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
      link: "text-teal-700 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes: Record<string, string> = {
      default: "h-11 px-4 py-2 text-sm min-h-[44px]",
      sm: "h-9 px-3 text-xs min-h-[36px]",
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
