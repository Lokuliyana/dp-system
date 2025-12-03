"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { ChevronRight } from "lucide-react"
import type React from "react"

interface StudentListItem {
  id: string
  name: string
  email?: string
  grade?: string
  value?: string | number
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
}

interface StudentsListCardProps {
  title: string
  description?: string
  icon?: React.ReactNode
  students: StudentListItem[]
  onSelectStudent?: (student: StudentListItem) => void
  emptyMessage?: string
  maxHeight?: string
}

export function StudentsListCard({
  title,
  description,
  icon,
  students,
  onSelectStudent,
  emptyMessage = "No students found",
  maxHeight = "max-h-96",
}: StudentsListCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {icon}
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`overflow-y-auto ${maxHeight} space-y-2`}>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{emptyMessage}</p>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{student.name}</p>
                  {student.email && <p className="text-xs text-muted-foreground truncate">{student.email}</p>}
                  {student.grade && <p className="text-xs text-muted-foreground">{student.grade}</p>}
                </div>
                {student.value && <p className="font-semibold mx-2 text-sm">{student.value}</p>}
                {student.badge && <span className="text-xs font-medium text-center min-w-12">{student.badge}</span>}
                {onSelectStudent && (
                  <Button variant="ghost" size="sm" onClick={() => onSelectStudent(student)} className="ml-2">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
