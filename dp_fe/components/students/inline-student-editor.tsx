"use client"

import { useState } from "react"
import type { Student } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Input } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Save, X, Edit2, Trash2 } from "lucide-react"

interface InlineStudentEditorProps {
  students: Student[]
  gradeId: string
  onUpdate: (student: Student) => void
  onDelete: (studentId: string) => void
}

interface EditingCell {
  studentId: string
  field: keyof Student
}

export function InlineStudentEditor({ students, gradeId, onUpdate, onDelete }: InlineStudentEditorProps) {
  const gradeStudents = students.filter((s) => {
    const sGradeId = (s.gradeId && typeof s.gradeId === 'object') ? (s.gradeId as any)._id : s.gradeId
    return sGradeId === gradeId
  })
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [editValue, setEditValue] = useState("")

  const handleStartEdit = (student: Student, field: keyof Student) => {
    setEditingCell({ studentId: student.id, field })
    setEditValue(String(student[field]))
  }

  const handleSaveEdit = (student: Student) => {
    if (!editingCell) return

    const updatedStudent = {
      ...student,
      [editingCell.field]: editValue,
    }

    onUpdate(updatedStudent)
    setEditingCell(null)
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
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

  const renderCell = (student: Student, field: keyof Student) => {
    const isEditing = editingCell?.studentId === student.id && editingCell?.field === field
    const value = student[field]

    if (isEditing) {
      if (field === "status" || field === "academicPerformance") {
        return (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field === "status" ? (
                <>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        )
      }

      return <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="h-8" autoFocus />
    }

    if (field === "status") {
      return <Badge className={getStatusBadgeColor(String(value))}>{String(value)}</Badge>
    }

    if (field === "academicPerformance") {
      return <Badge className={getPerformanceBadgeColor(String(value))}>{String(value).replace("-", " ")}</Badge>
    }

    return <span>{String(value)}</span>
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Quick Edit Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Roll</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Name</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Email</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Status</th>
                <th className="px-4 py-2 text-left font-semibold text-slate-900">Performance</th>
                <th className="px-4 py-2 text-right font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gradeStudents.map((student) => (
                <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td
                    className="px-4 py-2 cursor-pointer font-semibold"
                    onClick={() => handleStartEdit(student, "admissionNumber")}
                  >
                    {renderCell(student, "admissionNumber")}
                  </td>
                  <td className="px-4 py-2 cursor-pointer" onClick={() => handleStartEdit(student, "firstName")}>
                    {editingCell?.studentId === student.id && editingCell?.field === "firstName" ? (
                      <div className="flex gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-8 w-32"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleSaveEdit(student)} className="h-8 px-2">
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-8 px-2 bg-transparent"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span>{`${student.firstName} ${student.lastName}`}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-slate-600">{student.email}</td>
                  <td className="px-4 py-2 cursor-pointer" onClick={() => handleStartEdit(student, "status")}>
                    {renderCell(student, "status")}
                    {editingCell?.studentId === student.id && editingCell?.field === "status" && (
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" onClick={() => handleSaveEdit(student)} className="h-6 px-2 text-xs">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-6 px-2 text-xs bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                  <td
                    className="px-4 py-2 cursor-pointer"
                    onClick={() => handleStartEdit(student, "academicPerformance")}
                  >
                    {renderCell(student, "academicPerformance")}
                    {editingCell?.studentId === student.id && editingCell?.field === "academicPerformance" && (
                      <div className="flex gap-1 mt-1">
                        <Button size="sm" onClick={() => handleSaveEdit(student)} className="h-6 px-2 text-xs">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="h-6 px-2 text-xs bg-transparent"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartEdit(student, "firstName")}
                        className="h-7 px-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(student.id)}
                        className="h-7 px-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {gradeStudents.length === 0 && (
          <div className="py-8 text-center text-slate-600">No students in this grade yet.</div>
        )}
      </CardContent>
    </Card>
  )
}
