"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  onBlur?: () => void
  autoFocus?: boolean
}

export function CustomDatePicker({
  value,
  onChange,
  className = "",
  onKeyDown,
  onBlur,
  autoFocus = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [displayDate, setDisplayDate] = useState(() => {
    const date = value ? new Date(value) : new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onBlur])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setIsOpen(!isOpen)
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsOpen(false)
      onBlur?.()
    }

    onKeyDown?.(e)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const handleDateSelect = (day: number) => {
    const newDate = new Date(displayDate.getFullYear(), displayDate.getMonth(), day)
    const isoString = newDate.toISOString().split("T")[0]
    onChange(isoString)
    setIsOpen(false)
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setDisplayDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const getDaysInMonth = () => {
    const year = displayDate.getFullYear()
    const month = displayDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const selectedDate = value ? new Date(value) : null
  const isSelectedDate = (day: number) => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayDate.getMonth() &&
      selectedDate.getFullYear() === displayDate.getFullYear()
    )
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDate(value)}
          readOnly
          placeholder="Select date..."
          className="w-full h-8 px-2 pr-8 bg-transparent border-0 outline-none focus:bg-accent rounded cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
        />
        <Calendar className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 bg-popover border rounded-md shadow-lg p-3 min-w-[280px]">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => navigateMonth("prev")} className="p-1 hover:bg-accent rounded">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="font-medium">
              {displayDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </div>
            <button type="button" onClick={() => navigateMonth("next")} className="p-1 hover:bg-accent rounded">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, index) => (
              <button
                key={index}
                type="button"
                disabled={day === null}
                onClick={() => day && handleDateSelect(day)}
                className={cn(
                  "p-2 text-sm rounded hover:bg-accent disabled:opacity-0",
                  day && isSelectedDate(day) && "bg-primary text-primary-foreground hover:bg-primary",
                )}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
