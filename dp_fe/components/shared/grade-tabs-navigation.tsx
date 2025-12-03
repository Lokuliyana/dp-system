"use client"

import { Button } from "@/components/ui"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { Grade } from "@/lib/school-data"

interface GradeTabsNavigationProps {
  grades: Grade[]
  selectedGradeId: string | null
  onSelectGrade: (gradeId: string) => void
  studentCounts?: Record<string, number>
}

export function GradeTabsNavigation({
  grades,
  selectedGradeId,
  onSelectGrade,
  studentCounts = {},
}: GradeTabsNavigationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener("resize", checkScroll)
    return () => window.removeEventListener("resize", checkScroll)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: direction === "left" ? -200 : 200, behavior: "smooth" })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-lg border border-slate-200">
      {canScrollLeft && (
        <Button onClick={() => scroll("left")} variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto flex-1 scroll-smooth"
        onScroll={checkScroll}
        style={{ scrollBehavior: "smooth", scrollbarWidth: "none" }}
      >
        {grades.map((grade) => (
          <Button
            key={grade.id}
            onClick={() => onSelectGrade(grade.id)}
            variant={selectedGradeId === grade.id ? "default" : "outline"}
            className={`flex-shrink-0 whitespace-nowrap h-8 px-3 text-sm ${
              selectedGradeId === grade.id ? "bg-blue-600 text-white hover:bg-blue-700" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{grade.name}</span>
              {studentCounts[grade.id] && (
                <span className="text-xs bg-black/10 px-2 py-0.5 rounded-full">{studentCounts[grade.id]}</span>
              )}
            </div>
          </Button>
        ))}
      </div>

      {canScrollRight && (
        <Button onClick={() => scroll("right")} variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
