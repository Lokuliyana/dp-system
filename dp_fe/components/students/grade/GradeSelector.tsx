"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Users, BookOpen, Pencil } from "lucide-react"
import type { Grade } from "@/types/models"

interface GradeSelectorProps {
  grades: Grade[]
  onSelectGrade: (gradeId: string) => void
  onEdit: (grade: Grade) => void
  studentCountsByGrade: Record<string, number>
}

export function GradeSelector({ grades, onSelectGrade, onEdit, studentCountsByGrade }: GradeSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {grades.map((grade) => (
          <Card
            key={grade.id}
            className="hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {grade.nameSi || grade.nameEn}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Class Teacher:</span>
                  {/* Assuming classTeacherId is what we have, or we fetch teacher name separately */}
                  <span className="font-medium text-slate-900">
                    {grade.classTeacherId ? "Assigned" : "Not Assigned"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Students:
                  </span>
                  <span className="font-semibold text-slate-900">
                    {studentCountsByGrade[grade.id] || 0}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => onSelectGrade(grade.id)}
                  className="flex-1"
                >
                  View Students
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(grade);
                  }}
                  variant="outline"
                  size="icon"
                  title="Edit Grade"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
