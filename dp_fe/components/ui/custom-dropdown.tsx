"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CustomDropdownProps {
  value: string
  options: string[]
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onKeyDown?: (e: React.KeyboardEvent) => void
  onBlur?: () => void
  autoFocus?: boolean
}

export function CustomDropdown({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  onKeyDown,
  onBlur,
  autoFocus = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (autoFocus && triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onBlur?.()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onBlur])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        setHighlightedIndex(0)
      } else {
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (isOpen) {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (isOpen && highlightedIndex >= 0) {
        onChange(options[highlightedIndex])
        setIsOpen(false)
      } else {
        setIsOpen(!isOpen)
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      setIsOpen(false)
      onBlur?.()
    }

    onKeyDown?.(e)
  }

  const handleSelect = (option: string) => {
    onChange(option)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn("relative w-full", className)}>
      <button
        ref={triggerRef}
        type="button"
        className="w-full h-8 px-2 flex items-center justify-between bg-transparent border-0 outline-none focus:bg-accent rounded text-left"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
      >
        <span className="truncate">{value || placeholder}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((option, index) => (
            <button
              key={option}
              type="button"
              className={cn(
                "w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between",
                highlightedIndex === index && "bg-accent",
                value === option && "bg-accent/50",
              )}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span>{option}</span>
              {value === option && <Check className="h-3 w-3" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
