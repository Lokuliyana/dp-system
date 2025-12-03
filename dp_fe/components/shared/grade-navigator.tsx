"use client"

import { useState } from "react"
import { GRADES } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Search, BookOpen, Users } from "lucide-react"

interface GradeNavigatorProps {
  onSelectGrade: (gradeId: string) => void
  studentCountsByGrade: Record<string, number>
  selectedGradeId?: string
}

export function GradeNavigator({ onSelectGrade, studentCountsByGrade, selectedGradeId }: GradeNavigatorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredGrades = GRADES.filter(
    (grade) =>
      grade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.classTeacher.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      {/* Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Grades</h2>
          <p className="text-slate-600 text-sm mt-1">
            Manage {GRADES.length} grades with {Object.values(studentCountsByGrade).reduce((a, b) => a + b, 0)} total
            students
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2">
          <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
            Grid
          </Button>
          <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
            List
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search grades or teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredGrades.map((grade) => (
            <Card
              key={grade.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedGradeId === grade.id ? "border-blue-500 bg-blue-50/50" : "border-slate-200"
              }`}
              onClick={() => onSelectGrade(grade.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {grade.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Section:</span>
                    <Badge variant="outline">{grade.section}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Class Teacher:</span>
                    <span className="font-semibold text-slate-900 text-xs">{grade.classTeacher}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Students:
                    </span>
                    <Badge className="bg-blue-100 text-blue-700">{studentCountsByGrade[grade.id] || 0}</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => onSelectGrade(grade.id)}
                  className={`w-full ${
                    selectedGradeId === grade.id
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-900"
                  }`}
                >
                  {selectedGradeId === grade.id ? "Selected" : "Select"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Grade</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Section</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Class Teacher</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Students</th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrades.map((grade, index) => (
                    <tr
                      key={grade.id}
                      className={`border-b border-slate-200 hover:bg-slate-50 transition-colors ${
                        selectedGradeId === grade.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                          {grade.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{grade.section}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{grade.classTeacher}</td>
                      <td className="px-6 py-4 text-sm text-center">
                        <Badge className="bg-blue-100 text-blue-700">{studentCountsByGrade[grade.id] || 0}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          onClick={() => onSelectGrade(grade.id)}
                          variant={selectedGradeId === grade.id ? "default" : "outline"}
                          size="sm"
                        >
                          {selectedGradeId === grade.id ? "Selected" : "Select"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {filteredGrades.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No grades found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
