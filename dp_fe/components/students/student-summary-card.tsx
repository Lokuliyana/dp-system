"use client"

import { type Student, GRADES } from "@/lib/school-data"
import { Card, CardContent } from "@/components/ui"
import { Badge } from "@/components/ui"
import { User, FileText, Star, AlertCircle } from "lucide-react"

interface StudentSummaryCardProps {
  student: Student
}

export function StudentSummaryCard({ student }: StudentSummaryCardProps) {
  const gradeName = (student.gradeId && typeof student.gradeId === 'object') ? student.gradeId.nameEn : GRADES.find((g) => g.id === student.gradeId)?.name || student.gradeId || "N/A"

  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-700"
      case "good":
        return "bg-blue-100 text-blue-700"
      case "average":
        return "bg-yellow-100 text-yellow-700"
      case "needs-improvement":
        return "bg-red-100 text-red-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "inactive":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Header with name and status */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {student.firstName} {student.lastName}
                </h2>
                <p className="text-sm text-slate-600">
                  Roll No: {student.admissionNumber} | {gradeName}
                </p>
              </div>
              <Badge className={getStatusBadgeColor(student.status)}>{student.status}</Badge>
            </div>
          </div>

          {/* Quick stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <User className="h-3 w-3" />
                Performance
              </p>
              <Badge className={getPerformanceBadgeColor(student.academicPerformance)}>
                {student.academicPerformance.replace("-", " ")}
              </Badge>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Notes
              </p>
              <p className="text-lg font-bold text-slate-900">{student.notes.length}</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Talents
              </p>
              <p className="text-lg font-bold text-slate-900">{student.talents.length}</p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-100">
              <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Status
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {student.status === "active" ? "✓ Active" : "• Inactive"}
              </p>
            </div>
          </div>

          {/* Contact info */}
          <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-2 text-sm">
            <div>
              <p className="text-xs text-slate-600">Email</p>
              <p className="text-slate-900 font-medium">{student.email}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-600">Phone</p>
                <p className="text-slate-900 font-medium">{student.phoneNumber}</p>
              </div>
              <div>
                <p className="text-xs text-slate-600">DOB</p>
                <p className="text-slate-900 font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
