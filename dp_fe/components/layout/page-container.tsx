// components/common/page-container.tsx
"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageContainerVariant = "default" | "fluid";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  variant?: PageContainerVariant;
}

/**
 * Standard inner container for admin pages.
 *
 * - `default`: centered with max-width (good for forms, CRUD lists)
 * - `fluid`: full-width (good for dashboards, analytics, dense tables)
 *
 * On mobile, both effectively behave full-width because viewport < max-width.
 */
export function PageContainer({
  children,
  className,
  variant = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "px-4 py-4 sm:px-4 lg:px-6", // consistent padding
        variant === "default" && "mx-auto max-w-7xl",
        variant === "fluid" && "w-full",
        className
      )}
    >
      {children}
    </div>
  );
}
