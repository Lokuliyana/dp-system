"use client"

import { useState, useMemo } from "react"
import { type Student, GRADES } from "@/lib/school-data"
import { Card, CardContent } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { ChevronLeft, ChevronRight, Search, Mail, Phone, Calendar, MoreVertical, Eye, Edit } from "lucide-react"
import { format } from "date-fns"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StudentListViewProps {
  students: Student[]
  gradeId?: string
  onSelectStudent?: (student: Student) => void
  onEditStudent?: (student: Student) => void
  selectedStudentId?: string
  showGradeColumn?: boolean
  // Server-side pagination props
  totalItems?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  itemsPerPage?: number
  grades?: { id: string; name: string }[]
  // External filter props
  showFilters?: boolean
  searchTerm?: string
  onSearchChange?: (value: string) => void
  statusFilter?: string
  onStatusChange?: (value: string) => void
  performanceFilter?: string
  onPerformanceChange?: (value: string) => void
  sortBy?: "name" | "roll" | "performance"
  onSortChange?: (value: "name" | "roll" | "performance") => void
}

export function StudentListView({ 
  students, 
  gradeId, 
  onSelectStudent, 
  onEditStudent,
  selectedStudentId,
  showGradeColumn = false,
  totalItems,
  currentPage: externalPage,
  onPageChange,
  itemsPerPage = 10,
  grades = GRADES,
  showFilters = false,
  searchTerm: externalSearchTerm,
  onSearchChange,
  statusFilter: externalStatusFilter,
  onStatusChange,
  performanceFilter: externalPerformanceFilter,
  onPerformanceChange,
  sortBy: externalSortBy,
  onSortChange
}: StudentListViewProps) {
  const [internalSearchTerm, setInternalSearchTerm] = useState("")
  const [internalStatusFilter, setStatusFilter] = useState<string>("all")
  const [internalPerformanceFilter, setPerformanceFilter] = useState<string>("all")
  const [internalSortBy, setSortBy] = useState<"name" | "roll" | "performance">("roll")
  const [internalPage, setInternalPage] = useState(1)

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : internalSearchTerm;
  const statusFilter = externalStatusFilter !== undefined ? externalStatusFilter : internalStatusFilter;
  const performanceFilter = externalPerformanceFilter !== undefined ? externalPerformanceFilter : internalPerformanceFilter;
  const sortBy = externalSortBy !== undefined ? externalSortBy : internalSortBy;

  const isServerSide = typeof totalItems === 'number' && typeof externalPage === 'number';
  const currentPage = isServerSide ? externalPage : internalPage;

  const grade = gradeId ? grades.find((g) => g.id === gradeId) : null

  // Filter students (Client-side only if not server-side)
  const filteredStudents = useMemo(() => {
    if (isServerSide) return students;

    let filtered = students;
    
    if (gradeId) {
      filtered = filtered.filter((s) => s.gradeId === gradeId)
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          (s.fullNameEn && s.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.nameWithInitialsSi && s.nameWithInitialsSi.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (s.whatsappNumber && s.whatsappNumber.includes(searchTerm)) ||
          s.admissionNumber.toString().includes(searchTerm),
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
          return (a.nameWithInitialsSi || "").localeCompare(b.nameWithInitialsSi || "")
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
          return a.admissionNumber.localeCompare(b.admissionNumber)
      }
    })

    return filtered
  }, [students, gradeId, searchTerm, statusFilter, performanceFilter, sortBy, isServerSide])

  // Paginate (Client-side only)
  const totalPages = isServerSide 
    ? Math.ceil((totalItems || 0) / itemsPerPage)
    : Math.ceil(filteredStudents.length / itemsPerPage)

  const displayStudents = isServerSide
    ? students
    : filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (isServerSide && onPageChange) {
      onPageChange(newPage);
    } else {
      setInternalPage(newPage);
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
          <h2 className="text-2xl font-bold text-slate-900">{grade ? grade.name : "All Students"}</h2>
          <p className="text-slate-600 text-sm mt-1">
            {isServerSide ? totalItems : filteredStudents.length} students found
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      {(!isServerSide || showFilters) && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name, admission no, or whatsapp..."
                  value={searchTerm}
                  onChange={(e) => {
                    if (onSearchChange) {
                      onSearchChange(e.target.value)
                    } else {
                      setInternalSearchTerm(e.target.value)
                      setInternalPage(1)
                    }
                  }}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  if (onStatusChange) {
                    onStatusChange(value)
                  } else {
                    setStatusFilter(value)
                    setInternalPage(1)
                  }
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
                  if (onPerformanceChange) {
                    onPerformanceChange(value)
                  } else {
                    setPerformanceFilter(value)
                    setInternalPage(1)
                  }
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
              <Select 
                value={sortBy} 
                onValueChange={(value: any) => {
                  if (onSortChange) {
                    onSortChange(value)
                  } else {
                    setSortBy(value)
                  }
                }}
              >
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
      )}

      {/* Student List */}
      <Card>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Admission No</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name w/ Initials (Si)</th>
                  {showGradeColumn && (
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Grade</th>
                  )}
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Phone</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">DOB</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.map((student) => (
                  <tr
                    key={student.id}
                    className={`border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedStudentId === student.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => onSelectStudent?.(student)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 w-32">{student.admissionNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">
                      {student.nameWithInitialsSi || student.fullNameEn}
                    </td>
                    {showGradeColumn && (
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {grades.find(g => g.id === student.gradeId)?.name || student.gradeId}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {student.phoneNumber || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {student.dateOfBirth ? format(new Date(student.dateOfBirth), "MMM d, yyyy") : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onSelectStudent?.(student)
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onEditStudent?.(student)
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Student
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayStudents.length === 0 && (
            <div className="py-12 text-center text-slate-600">No students found matching your filters.</div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, isServerSide ? (totalItems || 0) : filteredStudents.length)} of {isServerSide ? totalItems : filteredStudents.length} students
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
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

