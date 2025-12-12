"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Search, X, Check } from "lucide-react"
import { Input } from "@/components/ui"
import { cn } from "@/lib/utils"

interface SearchOption {
  id: string
  name: string
  metadata?: string
  avatar?: string
}

interface EnhancedLiveSearchProps {
  options: SearchOption[]
  placeholder?: string
  onSelect: (option: SearchOption | SearchOption[]) => void
  multiSelect?: boolean
  maxSelections?: number
  onClose?: () => void
  className?: string
  mobileOptimized?: boolean
}

export function EnhancedLiveSearch({
  options,
  placeholder = "Search...",
  onSelect,
  multiSelect = false,
  maxSelections = 10,
  onClose,
  className,
  mobileOptimized = true,
}: EnhancedLiveSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItems, setSelectedItems] = useState<SearchOption[]>([])
  const [isOpen, setIsOpen] = useState(true)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedItems.find((item) => item.id === option.id),
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSelect = (option: SearchOption) => {
    if (multiSelect) {
      if (selectedItems.length < maxSelections) {
        const newSelected = [...selectedItems, option]
        setSelectedItems(newSelected)
        setSearchTerm("")
        setHighlightedIndex(0)
        onSelect(newSelected)
      }
    } else {
      setSelectedItems([option])
      onSelect(option)
      setIsOpen(false)
    }
  }

  const handleRemove = (id: string) => {
    const newSelected = selectedItems.filter((item) => item.id !== id)
    setSelectedItems(newSelected)
    if (multiSelect) {
      onSelect(newSelected)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
        break
      case "Enter":
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setIsOpen(false)
        onClose?.()
        break
    }
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {/* Selected Items Display */}
      {multiSelect && selectedItems.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium"
            >
              {item.avatar && (
                <img
                  src={item.avatar || "/placeholder.svg"}
                  alt={item.name}
                  className="h-5 w-5 rounded-full object-cover"
                />
              )}
              <span>{item.name}</span>
              <button onClick={() => handleRemove(item.id)} className="hover:text-destructive">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setHighlightedIndex(0)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className={cn(
              "pl-10 pr-4",
              mobileOptimized && "text-base md:text-sm", // Larger on mobile for better touch
            )}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("")
                setHighlightedIndex(0)
              }}
              className="absolute right-3 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && filteredOptions.length > 0 && (
          <div
            className={cn(
              "absolute top-full z-50 mt-2 w-full rounded-lg border bg-popover shadow-lg",
              mobileOptimized && "max-h-96 md:max-h-64", // More space on mobile
            )}
          >
            <div className="max-h-[400px] overflow-y-auto">
              {filteredOptions.map((option, index) => (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "w-full px-4 py-3 md:py-2 text-left flex items-center gap-3 transition-colors",
                    "hover:bg-accent/50 active:bg-accent",
                    index === highlightedIndex && "bg-accent",
                    mobileOptimized && "text-base md:text-sm", // Larger touch targets on mobile
                  )}
                >
                  {option.avatar && (
                    <img
                      src={option.avatar || "/placeholder.svg"}
                      alt={option.name}
                      className="h-8 w-8 md:h-6 md:w-6 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{option.name}</div>
                    {option.metadata && <div className="text-sm text-muted-foreground truncate">{option.metadata}</div>}
                  </div>
                  {selectedItems.find((item) => item.id === option.id) && (
                    <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {isOpen && searchTerm && filteredOptions.length === 0 && (
          <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-popover p-4 text-center text-sm text-muted-foreground">
            No results found for &quot;{searchTerm}&quot;
          </div>
        )}
      </div>

      {/* Helper Text */}
      {multiSelect && (
        <div className="mt-2 text-xs text-muted-foreground">
          {selectedItems.length} / {maxSelections} selected
        </div>
      )}
    </div>
  )
}
