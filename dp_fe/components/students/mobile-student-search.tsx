"use client"

import type React from "react"

import { useState, useMemo, useRef, useEffect } from "react"
import { Search, X, MapPin, BookOpen } from "lucide-react"
import { Input } from "@/components/ui"
import { Badge } from "@/components/ui"
import { cn } from "@/lib/utils"
import type { Student } from "@/lib/school-data"
import { GRADES } from "@/lib/school-data"

interface MobileStudentSearchProps {
  students: Student[]
  onSelect: (student: Student) => void
  onClose?: () => void
  placeholder?: string
  className?: string
  showGradeFilter?: boolean
  autoFocus?: boolean
}

export function MobileStudentSearch({
  students,
  onSelect,
  onClose,
  placeholder = "Search by name, roll, or email...",
  className,
  showGradeFilter = true,
  autoFocus = true,
}: MobileStudentSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Auto-focus on mount
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  // Filter students based on search and grade
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim() && !selectedGradeId) return []

    const term = searchTerm.toLowerCase()

    return students
      .filter((student) => {
        // Grade filter
        const sGradeId = typeof student.gradeId === 'object' ? student.gradeId._id : student.gradeId
        if (selectedGradeId && sGradeId !== selectedGradeId) return false

        // Search term filter
        if (searchTerm.trim()) {
          const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
          const email = student.email.toLowerCase()
          const rollStr = student.admissionNumber.toString()

          return fullName.includes(term) || email.includes(term) || rollStr.includes(term)
        }

        return true
      })
      .sort((a, b) => {
        // Sort by relevance
        const aName = `${a.firstName} ${a.lastName}`.toLowerCase()
        const bName = `${b.firstName} ${b.lastName}`.toLowerCase()

        // Prioritize name matches
        if (aName.startsWith(term) && !bName.startsWith(term)) return -1
        if (!aName.startsWith(term) && bName.startsWith(term)) return 1

        // Then by roll number
        return a.admissionNumber.localeCompare(b.admissionNumber)
      })
      .slice(0, 12)
  }, [searchTerm, selectedGradeId, students])

  const handleSelect = (student: Student) => {
    // Add to recent searches
    const searchKey = `${student.firstName} ${student.lastName}`
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== searchKey)
      return [searchKey, ...filtered].slice(0, 5)
    })

    onSelect(student)
    setSearchTerm("")
    setHighlightedIndex(0)
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredStudents.length))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev === 0 ? Math.max(0, filteredStudents.length - 1) : prev - 1))
        break
      case "Enter":
        e.preventDefault()
        if (filteredStudents[highlightedIndex]) {
          handleSelect(filteredStudents[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        onClose?.()
        break
    }
  }

  const getGradeName = (gradeId: string | { _id: string; nameEn: string }) => {
    if (typeof gradeId === 'object') return gradeId.nameEn
    return GRADES.find((g) => g.id === gradeId)?.name || gradeId
  }

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-800"
      case "good":
        return "bg-blue-100 text-blue-800"
      case "average":
        return "bg-yellow-100 text-yellow-800"
      case "needs-improvement":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center gap-2 relative">
          <Search className="h-5 w-5 text-slate-400 absolute left-3 pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setHighlightedIndex(0)
              setIsOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsOpen(true)
            }}
            className="pl-10 pr-10 h-12 text-base rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("")
                setHighlightedIndex(0)
                inputRef.current?.focus()
              }}
              className="absolute right-3 p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Grade Filter Buttons */}
        {showGradeFilter && (
          <div className="flex flex-wrap gap-2 mt-3 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedGradeId(null)}
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                selectedGradeId === null ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              )}
            >
              All Grades
            </button>
            {GRADES.slice(0, 6).map((grade) => (
              <button
                key={grade.id}
                onClick={() => setSelectedGradeId(grade.id)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedGradeId === grade.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {grade.name}
              </button>
            ))}
          </div>
        )}

        {/* Suggestions Dropdown */}
        {isOpen && (searchTerm || selectedGradeId) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[60vh] overflow-y-auto">
            {filteredStudents.length > 0 ? (
              <div className="divide-y">
                {filteredStudents.map((student, index) => (
                  <button
                    key={student.id}
                    onClick={() => handleSelect(student)}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-colors active:bg-blue-50",
                      index === highlightedIndex ? "bg-blue-50" : "hover:bg-slate-50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Name and Roll */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900 truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            Roll {student.admissionNumber}
                          </Badge>
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-3 mt-1 text-sm text-slate-600 flex-wrap">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{getGradeName(student.gradeId)}</span>
                          </div>
                          <div className="flex items-center gap-1 truncate">
                            <BookOpen className="h-3 w-3" />
                            <span className="truncate">{student.email}</span>
                          </div>
                        </div>

                        {/* Performance badge */}
                        <div className="mt-2">
                          <Badge className={getPerformanceColor(student.academicPerformance)}>
                            {student.academicPerformance.replace("-", " ")}
                          </Badge>
                        </div>
                      </div>

                      {/* Status indicator */}
                      {student.status !== "active" && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {student.status}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="px-4 py-8 text-center text-slate-600">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No students found</p>
                <p className="text-sm mt-1">Try searching by name, roll number, or email</p>
              </div>
            ) : selectedGradeId ? (
              <div className="px-4 py-8 text-center text-slate-600">
                <p className="font-medium">Start typing to search</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Recent Searches (when input is focused but empty) */}
        {isOpen && !searchTerm && recentSearches.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-xl z-50">
            <div className="px-4 py-3 border-b">
              <p className="text-xs font-semibold text-slate-600 uppercase">Recent Searches</p>
            </div>
            <div className="divide-y">
              {recentSearches.map((name) => (
                <button
                  key={name}
                  onClick={() => {
                    setSearchTerm(name)
                    setIsOpen(true)
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Search className="h-4 w-4 text-slate-400" />
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Stats */}
      {(searchTerm || selectedGradeId) && filteredStudents.length > 0 && (
        <p className="mt-2 text-xs text-slate-600">
          Found {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  )
}
