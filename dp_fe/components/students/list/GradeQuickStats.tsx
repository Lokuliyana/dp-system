// components/list/GradeQuickStats.tsx
"use client";

import type { Student } from "@/lib/school-data";
import { Card, CardContent } from "@/components/ui";
import { Users, Activity, Award, UserX } from "lucide-react";

interface GradeQuickStatsProps {
  students: Student[];
  classTeacher?: string;
}

export function GradeQuickStats({
  students,
  classTeacher,
}: GradeQuickStatsProps) {
  const total = students.length;
  const active = students.filter((s) => s.status === "active").length;
  const inactive = students.filter((s) => s.status !== "active").length;
  const excellent = students.filter(
    (s) => s.academicPerformance === "excellent",
  ).length;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total Students
            </p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {total}
            </p>
            {classTeacher && (
              <p className="mt-1 text-xs text-slate-500">
                Class Teacher:{" "}
                <span className="font-medium text-slate-800">
                  {classTeacher}
                </span>
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-700">
            <Users className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Active
            </p>
            <p className="mt-1 text-2xl font-semibold text-emerald-600">
              {active}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {(total && Math.round((active / total) * 100)) || 0}% of grade
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
            <Activity className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Top Performers
            </p>
            <p className="mt-1 text-2xl font-semibold text-indigo-600">
              {excellent}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Excellent academic performance
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
            <Award className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Inactive / Transferred
            </p>
            <p className="mt-1 text-2xl font-semibold text-rose-600">
              {inactive}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Students needing follow-up
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-700">
            <UserX className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
