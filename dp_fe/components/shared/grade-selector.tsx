"use client"

import { GRADES } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Users, BookOpen } from "lucide-react"

interface GradeSelectorProps {
  onSelectGrade: (gradeId: string) => void
  studentCountsByGrade: Record<string, number>
}

export function GradeSelector({ onSelectGrade, studentCountsByGrade }: GradeSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Select a Grade</h2>
        <p className="text-slate-600">Choose a grade to manage students and view enrollment information</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {GRADES.map((grade) => (
          <Card key={grade.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {grade.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Class Teacher:</span>
                  <span className="font-semibold text-slate-900">{grade.classTeacher}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Students:
                  </span>
                  <span className="font-semibold text-slate-900">{studentCountsByGrade[grade.id] || 0}</span>
                </div>
              </div>
              <Button
                onClick={() => onSelectGrade(grade.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                View Students
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
