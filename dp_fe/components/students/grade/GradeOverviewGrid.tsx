// components/grade/GradeOverviewGrid.tsx
"use client";

import { GRADES } from "@/lib/school-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui";

interface GradeOverviewGridProps {
  studentCountsByGrade: Record<string, number>;
  onSelectGrade: (gradeId: string) => void;
}

export function GradeOverviewGrid({
  studentCountsByGrade,
  onSelectGrade,
}: GradeOverviewGridProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">
          Select a Grade
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Choose a grade to manage students, attendance, and extracurricular
          records.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {GRADES.map((grade) => {
          const count = studentCountsByGrade[grade.id] || 0;
          return (
            <Card
              key={grade.id}
              className="group cursor-pointer border-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md"
              onClick={() => onSelectGrade(grade.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-2 text-base">
                  <span className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <span>{grade.name}</span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {grade.section}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Class Teacher</span>
                    <span className="font-medium text-slate-900">
                      {grade.classTeacher}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-600">
                      <Users className="h-4 w-4" />
                      Students
                    </span>
                    <span className="text-base font-semibold text-slate-900">
                      {count}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectGrade(grade.id);
                  }}
                >
                  Manage Grade
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
