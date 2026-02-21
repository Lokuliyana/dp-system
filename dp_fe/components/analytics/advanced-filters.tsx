"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Card, CardContent } from "@/components/ui"
import { X, Filter } from "lucide-react"
import { LiveSearch } from "@/components/reusable"

interface FilterConfig {
  gradeId?: string
  performanceLevel?: string
  attendanceRange?: [number, number]
  talentCategory?: string
  dateRange?: [string, string]
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterConfig) => void
  grades: Array<{ id: string; name: string }>
  performanceLevels: string[]
  talentCategories: string[]
}

export function AdvancedFilters({
  onFiltersChange,
  grades,
  performanceLevels,
  talentCategories,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<FilterConfig>({})
  const [gradeSearchTerm, setGradeSearchTerm] = useState("")

  const searchableGrades = useMemo(() => {
    return grades.map((g) => ({
      ...g,
      displayName: g.name,
    }))
  }, [grades])

  const filteredGrades = useMemo(() => {
    const q = gradeSearchTerm.trim().toLowerCase()
    if (!q) return searchableGrades
    return searchableGrades.filter((g) => g.displayName.toLowerCase().includes(q))
  }, [searchableGrades, gradeSearchTerm])

  const handleFilterChange = (key: keyof FilterConfig, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setFilters({})
    onFiltersChange({})
  }

  const activeFilterCount = Object.keys(filters).filter((k) => filters[k as keyof FilterConfig]).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant={isOpen ? "default" : "outline"} onClick={() => setIsOpen(!isOpen)} className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {isOpen && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Grade</label>
              <LiveSearch
                data={filteredGrades}
                labelKey="displayName"
                valueKey="id"
                onSearch={setGradeSearchTerm}
                selected={(val) => handleFilterChange("gradeId", val.item?.id || undefined)}
                defaultSelected={filters.gradeId}
                placeholder="All Grades"
                mode="filter"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Performance Level</label>
              <select
                value={filters.performanceLevel || ""}
                onChange={(e) => handleFilterChange("performanceLevel", e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Levels</option>
                {performanceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Attendance Range (%)</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Min"
                  value={filters.attendanceRange?.[0] || ""}
                  onChange={(e) => {
                    const min = e.target.value ? Number.parseInt(e.target.value) : undefined
                    handleFilterChange("attendanceRange", [min || 0, filters.attendanceRange?.[1] || 100])
                  }}
                />
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="Max"
                  value={filters.attendanceRange?.[1] || ""}
                  onChange={(e) => {
                    const max = e.target.value ? Number.parseInt(e.target.value) : undefined
                    handleFilterChange("attendanceRange", [filters.attendanceRange?.[0] || 0, max || 100])
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Talent Category</label>
              <select
                value={filters.talentCategory || ""}
                onChange={(e) => handleFilterChange("talentCategory", e.target.value || undefined)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="">All Categories</option>
                {talentCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
