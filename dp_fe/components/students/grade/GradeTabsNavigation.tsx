// components/grade/GradeTabsNavigation.tsx
"use client";

import { cn } from "@/lib/utils";

interface GradeTab {
  id: string;
  name: string;
}

interface GradeTabsNavigationProps {
  grades: GradeTab[];
  selectedGradeId: string;
  onSelectGrade: (id: string) => void;
  studentCounts?: Record<string, number>;
}

export function GradeTabsNavigation({
  grades,
  selectedGradeId,
  onSelectGrade,
  studentCounts,
}: GradeTabsNavigationProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Grades
        </h2>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto rounded-lg border bg-slate-50 p-1">
        {grades.map((grade) => {
          const isActive = grade.id === selectedGradeId;
          const count = studentCounts?.[grade.id];

          return (
            <button
              key={grade.id}
              type="button"
              onClick={() => onSelectGrade(grade.id)}
              className={cn(
                "flex min-w-[120px] items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium transition-colors",
                isActive
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900",
              )}
            >
              <span className="truncate">{grade.name}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "ml-2 inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-full text-[10px]",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-200 text-slate-700",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
