"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Users, BookOpen, Pencil, Trash2 } from "lucide-react"
import type { Grade } from "@/types/models"

interface GradeSelectorProps {
  grades: Grade[]
  onSelectGrade: (gradeId: string) => void
  onEdit: (grade: Grade) => void
  onDelete: (gradeId: string) => void
  studentCountsByGrade: Record<string, number>
}

export function GradeSelector({ grades, onSelectGrade, onEdit, onDelete, studentCountsByGrade }: GradeSelectorProps) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {grades.map((grade) => (
          <Card
            key={grade.id}
            className="hover:shadow-md transition-all duration-200 cursor-pointer group relative overflow-hidden"
            onClick={() => onSelectGrade(grade.id)}
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-base font-bold">{grade.nameEn}</div>
                  <div className="text-xs font-normal text-muted-foreground">{grade.nameSi}</div>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 pt-2">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center p-2 bg-slate-50 rounded-md">
                  <span className="text-slate-600 flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    Students
                  </span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border shadow-sm">
                    {studentCountsByGrade[grade.id] || 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center px-2">
                  <span className="text-slate-500 text-xs">Class Teacher</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${grade.classTeacherId ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {grade.classTeacherId ? "Assigned" : "Pending"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t mt-4">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(grade);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-xs gap-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(grade.id);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
