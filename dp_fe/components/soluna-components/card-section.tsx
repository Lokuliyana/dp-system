// components/reusable/card-section.tsx
"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui";
import { Button } from "@/components/ui";

type CardSectionProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  viewAllLabel?: string;
  onViewAll?: () => void;
  children: ReactNode;
};

export function CardSection({
  title,
  description,
  icon: Icon,
  viewAllLabel = "View all",
  onViewAll,
  children,
}: CardSectionProps) {
  return (
    <section className="w-full">
      <Card className="border border-slate-200 bg-white rounded-lg shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            {/* Left: icon + title/description */}
            <div className="flex flex-1 items-start gap-2">
              {Icon && (
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              )}

              <div className="flex flex-col">
                <CardTitle className="text-base font-semibold text-slate-900 md:text-sm lg:text-base">
                  {title}
                </CardTitle>
                {description && (
                  <CardDescription className="mt-1 text-xs text-slate-600 md:text-sm">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>

            {/* Right: view all button */}
            {onViewAll && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="inline-flex items-center gap-1 text-xs text-slate-700 hover:text-slate-900"
                onClick={onViewAll}
              >
                <span className="hidden md:inline">{viewAllLabel}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-4 md:pb-5">
          {children}
        </CardContent>
      </Card>
    </section>
  );
}
