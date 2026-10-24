import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50",
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-1">
        {title}
      </h3>
      <p className="text-sm font-normal text-slate-500 max-w-sm mb-6">
        {description}
      </p>
      {action && <div className="flex items-center gap-4">{action}</div>}
    </div>
  );
}
