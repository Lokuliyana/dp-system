"use client"

import { useState, useMemo } from "react"
import { type Student, GRADES } from "@/lib/school-data"
import { Card, CardContent } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { ChevronLeft, ChevronRight, Search, Mail, Phone } from "lucide-react"

interface StudentListViewProps {
  students: Student[]
  gradeId: string
  onSelectStudent?: (student: Student) => void
  selectedStudentId?: string
}

export function StudentListView({ students, gradeId, onSelectStudent, selectedStudentId }: StudentListViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [performanceFilter, setPerformanceFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "roll" | "performance">("roll")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const grade = GRADES.find((g) => g.id === gradeId)

  // Filter students
  const filteredStudents = useMemo(() => {
    let filtered = students.filter((s) => s.gradeId === gradeId)

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.rollNumber.toString().includes(searchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((s) => s.status === statusFilter)
    }

    // Apply performance filter
    if (performanceFilter !== "all") {
      filtered = filtered.filter((s) => s.academicPerformance === performanceFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case "performance":
          const perfOrder = {
            excellent: 0,
            good: 1,
            average: 2,
            "needs-improvement": 3,
          }
          return perfOrder[a.academicPerformance] - perfOrder[b.academicPerformance]
        case "roll":
        default:
          return a.rollNumber - b.rollNumber
      }
    })

    return filtered
  }, [students, gradeId, searchTerm, statusFilter, performanceFilter, sortBy])

  // Paginate
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
      case "transferred":
        return "bg-blue-100 text-blue-700"
      case "graduated":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-slate-100 text-slate-700"
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{grade?.name}</h2>
          <p className="text-slate-600 text-sm mt-1">{filteredStudents.length} students found</p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or roll number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="transferred">Transferred</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>

            {/* Performance Filter */}
            <Select
              value={performanceFilter}
              onValueChange={(value) => {
                setPerformanceFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Performance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="roll">Roll Number</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Roll</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Performance</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedStudentId === student.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => onSelectStudent?.(student)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 w-12">{student.rollNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {student.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getPerformanceBadgeColor(student.academicPerformance)}>
                        {student.academicPerformance.replace("-", " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={getStatusBadgeColor(student.status)}>{student.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectStudent?.(student)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginatedStudents.length === 0 && (
            <div className="py-12 text-center text-slate-600">No students found matching your filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 py-2 text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
