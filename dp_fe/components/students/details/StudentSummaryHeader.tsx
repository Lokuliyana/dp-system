"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Activity, Star, Users } from "lucide-react";
import type { Student } from "@/types/models";
import { Badge } from "@/components/ui";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface StudentSummaryHeaderStats {
  attendanceRate?: number;      // 0–100
  totalTalents?: number;
  totalNotes?: number;
  clubsCount?: number;
}

interface StudentSummaryHeaderProps {
  student: Student;
  gradeName?: string;
  stats?: StudentSummaryHeaderStats;
  onBack?: () => void;
}

export const StudentSummaryHeader = memo(function StudentSummaryHeader({
  student,
  gradeName,
  stats,
  onBack,
}: StudentSummaryHeaderProps) {
  const initials = useMemo(
    () =>
      `${student.firstNameSi?.[0] || ""}${student.lastNameSi?.[0] || ""}`.toUpperCase() ||
      (student.id ? student.id.slice(0, 2).toUpperCase() : "??"),
    [student.firstNameSi, student.lastNameSi, student.id]
  );

  const fullName = `${student.firstNameSi || student.firstNameEn || ""} ${student.lastNameSi || student.lastNameEn || ""}`.trim();

  // academicPerformance and status fields are not present in the new Student type from types/models.
  // Removing related logic and UI elements.

  return (
    <motion.section
      className="mb-6 rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 px-4 py-4 sm:px-6 sm:py-5 shadow-sm"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      layout
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Avatar + basic info */}
        <div className="flex flex-1 items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-xl font-semibold text-blue-700 shadow-sm">
            <User className="mr-1 h-4 w-4 text-blue-400" />
            <span>{initials}</span>
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
                {fullName || "Unnamed Student"}
              </h1>
              {/* Status and Performance badges removed as they are not in the model yet */}
            </div>

            <p className="text-sm text-slate-600">
              Grade <span className="font-semibold">{gradeName || (typeof student.gradeId === 'object' ? student.gradeId.nameEn : student.gradeId)}</span>{" "}
              <span className="mx-1">•</span>
              Admission No <span className="font-semibold">{student.admissionNumber}</span>
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              {student.email && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {student.email}
                </span>
              )}
              {student.phoneNum && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {student.phoneNum}
                </span>
              )}
              {student.dob && (
                <span className="hidden items-center gap-1 sm:flex">
                  <Activity className="h-3.5 w-3.5" />
                  DOB: {new Date(student.dob).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: KPIs */}
        <motion.div
          className="grid w-full max-w-xl grid-cols-2 gap-3 rounded-lg bg-white/80 p-3 text-xs shadow-inner sm:grid-cols-4"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: 0.05 }}
        >
          <KpiTile
            label="Attendance"
            value={stats?.attendanceRate != null ? `${stats.attendanceRate}%` : "—"}
            icon={Activity}
            tone={stats?.attendanceRate != null && stats.attendanceRate < 80 ? "warn" : "ok"}
          />
          <KpiTile
            label="Talents"
            value={stats?.totalTalents != null ? stats.totalTalents : "—"}
            icon={Star}
          />
          <KpiTile
            label="Notes"
            value={stats?.totalNotes != null ? stats.totalNotes : "—"}
            icon={Mail}
          />
          <KpiTile
            label="Clubs"
            value={stats?.clubsCount != null ? stats.clubsCount : "—"}
            icon={Users}
          />
        </motion.div>
      </div>

      {onBack && (
        <div className="mt-3 flex justify-between gap-3 text-xs">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-7 border-slate-300 px-2 text-xs text-slate-700"
          >
            Back to Students
          </Button>
        </div>
      )}
    </motion.section>
  );
});

interface KpiTileProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone?: "ok" | "warn" | "neutral";
}

function KpiTile({ label, value, icon: Icon, tone = "neutral" }: KpiTileProps) {
  const toneClass =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
      ? "text-amber-700"
      : "text-slate-700";

  return (
    <div className="flex flex-col gap-1 rounded-md border border-slate-100 bg-slate-50/60 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
        <Icon className={cn("h-3.5 w-3.5 opacity-70", toneClass)} />
      </div>
      <span className={cn("text-base font-semibold", toneClass)}>{value}</span>
    </div>
  );
}
