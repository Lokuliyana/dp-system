"use client"

import type React from "react"

import { useState, useCallback, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Checkbox } from "@/components/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge } from "@/components/ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui"
import { CustomDropdown } from "@/components/ui"
import { CustomDatePicker } from "@/components/ui"
import { CustomInput } from "@/components/ui"
import {
  Trash2,
  Plus,
  Save,
  Edit3,
  ChevronUp,
  ChevronDown,
  Search,
  Download,
  Columns,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  FileSpreadsheet,
  Printer,
  Lock,
  ArrowUpDown,
  Pin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface TableColumn<T> {
  key: keyof T
  label: string
  type?: "text" | "email" | "select" | "date" | "number" | "currency" | "percentage" | "boolean" | "custom"
  options?: string[] | { value: string; label: string }[]
  width?: string
  minWidth?: string
  maxWidth?: string
  sortable?: boolean
  filterable?: boolean
  editable?: boolean
  required?: boolean
  validation?: (value: any) => string | null
  format?: (value: any) => string
  render?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode
  frozen?: boolean
  resizable?: boolean
  aggregation?: "sum" | "avg" | "count" | "min" | "max"
  description?: string
  group?: string
}

export interface RowDecoration<T> {
  className?: string
  style?: React.CSSProperties
  condition?: (row: T) => boolean
  priority?: number
  tooltip?: string
}

export interface ValidationError {
  rowId: string
  field: keyof any
  message: string
}

export interface AuditLog<T> {
  id: string
  timestamp: Date
  action: "create" | "update" | "delete"
  rowId: string
  field?: keyof T
  oldValue?: any
  newValue?: any
  user?: string
}

export interface AdvancedTableProps<T extends Record<string, any>> {
  data: T[]
  columns: TableColumn<T>[]
  title?: string
  subtitle?: string
  icon?: React.ReactNode
  onDataChange?: (data: T[], auditLog?: AuditLog<T>) => void
  onSave?: (data: T[]) => Promise<{ success: boolean; errors?: ValidationError[] }>
  onAddRow?: () => T
  onDeleteRows?: (selectedIds: string[]) => Promise<boolean>
  onRefresh?: () => Promise<void>
  rowDecorations?: RowDecoration<T>[]
  enableSelection?: boolean
  enableBulkActions?: boolean
  enableSearch?: boolean
  enableFiltering?: boolean
  enableSorting?: boolean
  enableColumnVisibility?: boolean
  enableExport?: boolean
  enableAuditLog?: boolean
  enableValidation?: boolean
  enableRowNumbers?: boolean
  enableStatusBar?: boolean
  editable?: boolean
  readOnly?: boolean
  pageSize?: number
  stickyHeader?: boolean
  virtualScrolling?: boolean
  autoSave?: boolean
  autoSaveInterval?: number
  className?: string
  idField?: keyof T
  timestampField?: keyof T
  userField?: keyof T
  maxRows?: number
  showAggregations?: boolean
  compactMode?: boolean
  theme?: "default" | "industrial" | "minimal"
}

interface SortConfig<T> {
  key: keyof T
  direction: "asc" | "desc"
}

interface FilterConfig {
  [key: string]: {
    value: string
    operator: "contains" | "equals" | "startsWith" | "endsWith" | "gt" | "lt" | "gte" | "lte"
  }
}

export function AdvancedTable<T extends Record<string, any>>(props: AdvancedTableProps<T>) {
  const {
    data,
    columns,
    title = "Data Management System",
    subtitle,
    icon = <Edit3 className="h-5 w-5" />,
    onDataChange,
    onSave,
    onAddRow,
    onDeleteRows,
    onRefresh,
    rowDecorations = [],
    enableSelection = true,
    enableBulkActions = true,
    enableSearch = true,
    enableFiltering = true,
    enableSorting = true,
    enableColumnVisibility = true,
    enableExport = true,
    enableAuditLog = false,
    enableValidation = true,
    enableRowNumbers = true,
    enableStatusBar = true,
    editable = false,
    readOnly = false,
    pageSize = 100,
    stickyHeader = true,
    virtualScrolling = false,
    autoSave = false,
    autoSaveInterval = 30000,
    className = "",
    idField = "id" as keyof T,
    timestampField = "updatedAt" as keyof T,
    userField = "updatedBy" as keyof T,
    maxRows = 10000,
    showAggregations = false,
    compactMode = false,
    theme = "industrial",
  } = props

  const { toast } = useToast()

  const [localData, setLocalData] = useState<T[]>(data)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: keyof T } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  const [filters, setFilters] = useState<FilterConfig>({})
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(new Set(columns.map((col) => col.key)))
  const [frozenColumns, setFrozenColumns] = useState<Set<keyof T>>(
    new Set(columns.filter((col) => col.frozen).map((col) => col.key)),
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [auditLog, setAuditLog] = useState<AuditLog<T>[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [columnWidths, setColumnWidths] = useState<Map<keyof T, number>>(new Map())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const tableRef = useRef<HTMLDivElement>(null)
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const autoSaveRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setLocalData(data)
    if (enableValidation) {
      validateAllData(data)
    }
  }, [data, enableValidation])

  useEffect(() => {
    if (autoSave && hasUnsavedChanges && onSave) {
      autoSaveRef.current = setTimeout(() => {
        saveAllChanges()
      }, autoSaveInterval)
    }

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current)
      }
    }
  }, [autoSave, hasUnsavedChanges, autoSaveInterval])

  const validateAllData = useCallback(
    (dataToValidate: T[]) => {
      const errors: ValidationError[] = []

      dataToValidate.forEach((row) => {
        columns.forEach((column) => {
          if (column.validation) {
            const error = column.validation(row[column.key])
            if (error) {
              errors.push({
                rowId: String(row[idField]),
                field: column.key,
                message: error,
              })
            }
          }

          if (column.required && (!row[column.key] || row[column.key] === "")) {
            errors.push({
              rowId: String(row[idField]),
              field: column.key,
              message: `${column.label} is required`,
            })
          }
        })
      })

      setValidationErrors(errors)
    },
    [columns, idField],
  )

  const processedData = useMemo(() => {
    let filtered = [...localData]

    // Apply search
    if (enableSearch && searchTerm) {
      filtered = filtered.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply advanced column filters
    if (enableFiltering) {
      Object.entries(filters).forEach(([key, filter]) => {
        if (filter.value) {
          filtered = filtered.filter((row) => {
            const cellValue = String(row[key]).toLowerCase()
            const filterValue = filter.value.toLowerCase()

            switch (filter.operator) {
              case "equals":
                return cellValue === filterValue
              case "startsWith":
                return cellValue.startsWith(filterValue)
              case "endsWith":
                return cellValue.endsWith(filterValue)
              case "gt":
                return Number(cellValue) > Number(filterValue)
              case "lt":
                return Number(cellValue) < Number(filterValue)
              case "gte":
                return Number(cellValue) >= Number(filterValue)
              case "lte":
                return Number(cellValue) <= Number(filterValue)
              default:
                return cellValue.includes(filterValue)
            }
          })
        }
      })
    }

    // Apply sorting
    if (enableSorting && sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return filtered
  }, [localData, searchTerm, filters, sortConfig, enableSearch, enableFiltering, enableSorting])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return processedData.slice(startIndex, startIndex + pageSize)
  }, [processedData, currentPage, pageSize])

  const totalPages = Math.ceil(processedData.length / pageSize)

  const aggregations = useMemo(() => {
    if (!showAggregations) return {}

    const aggs: Record<string, any> = {}

    columns.forEach((column) => {
      if (column.aggregation && column.type === "number") {
        const values = processedData.map((row) => Number(row[column.key]) || 0)

        switch (column.aggregation) {
          case "sum":
            aggs[String(column.key)] = values.reduce((sum, val) => sum + val, 0)
            break
          case "avg":
            aggs[String(column.key)] = values.length ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
            break
          case "count":
            aggs[String(column.key)] = values.length
            break
          case "min":
            aggs[String(column.key)] = Math.min(...values)
            break
          case "max":
            aggs[String(column.key)] = Math.max(...values)
            break
        }
      }
    })

    return aggs
  }, [processedData, columns, showAggregations])

  const getRowDecorations = useCallback(
    (row: T) => {
      const decorations = rowDecorations
        .filter((decoration) => !decoration.condition || decoration.condition(row))
        .sort((a, b) => (b.priority || 0) - (a.priority || 0))

      return {
        className: decorations
          .map((d) => d.className)
          .filter(Boolean)
          .join(" "),
        style: decorations.reduce((acc, d) => ({ ...acc, ...d.style }), {}),
        tooltip: decorations.find((d) => d.tooltip)?.tooltip,
      }
    },
    [rowDecorations],
  )

  const handleDataChange = useCallback(
    (newData: T[], auditEntry?: AuditLog<T>) => {
      setLocalData(newData)
      setHasUnsavedChanges(true)

      if (enableValidation) {
        validateAllData(newData)
      }

      if (enableAuditLog && auditEntry) {
        setAuditLog((prev) => [auditEntry, ...prev].slice(0, 1000)) // Keep last 1000 entries
      }

      onDataChange?.(newData, auditEntry)
    },
    [onDataChange, enableValidation, enableAuditLog, validateAllData],
  )

  const handleSort = useCallback(
    (key: keyof T) => {
      if (!enableSorting) return

      setSortConfig((current) => {
        if (current?.key === key) {
          return current.direction === "asc" ? { key, direction: "desc" } : null
        }
        return { key, direction: "asc" }
      })
    },
    [enableSorting],
  )

  const handleFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: { value: value, operator: "contains" } }))
    setCurrentPage(1)
  }, [])

  const toggleRowSelection = useCallback(
    (rowId: string) => {
      if (!enableSelection) return

      setSelectedRows((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(rowId)) {
          newSet.delete(rowId)
        } else {
          newSet.add(rowId)
        }
        return newSet
      })
    },
    [enableSelection],
  )

  const toggleSelectAll = useCallback(() => {
    if (!enableSelection) return

    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((row) => String(row[idField]))))
    }
  }, [selectedRows.size, paginatedData, enableSelection, idField])

  const saveCellEdit = useCallback(() => {
    if (!editingCell) return

    const newData = localData.map((row) =>
      String(row[idField]) === editingCell.rowId ? { ...row, [editingCell.field]: editValue } : row,
    )

    handleDataChange(newData, {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: "update",
      rowId: editingCell.rowId,
      field: editingCell.field,
      oldValue: localData.find((row) => String(row[idField]) === editingCell.rowId)?.[editingCell.field],
      newValue: editValue,
      user: "currentUser", // Replace with actual user info
    })
    setEditingCell(null)
    setEditValue("")

    toast({
      title: "Cell Updated",
      description: "Changes saved locally. Click 'Save All Changes' to persist.",
    })
  }, [editingCell, editValue, localData, handleDataChange, toast, idField])

  const cancelCellEdit = useCallback(() => {
    setEditingCell(null)
    setEditValue("")
  }, [])

  const addNewRow = useCallback(() => {
    if (!onAddRow) return

    const newRow = onAddRow()
    handleDataChange([...localData, newRow], {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action: "create",
      rowId: String(newRow[idField]),
      user: "currentUser", // Replace with actual user info
    })
  }, [onAddRow, localData, handleDataChange, idField])

  const deleteSelectedRows = useCallback(async () => {
    if (!enableBulkActions || selectedRows.size === 0) return

    const selectedIds = Array.from(selectedRows)

    setIsLoading(true)
    try {
      const success = onDeleteRows ? await onDeleteRows(selectedIds) : true

      if (success) {
        const newData = localData.filter((row) => !selectedRows.has(String(row[idField])))
        handleDataChange(newData, {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          action: "delete",
          rowId: selectedIds.join(","),
          user: "currentUser", // Replace with actual user info
        })
        setSelectedRows(new Set())

        toast({
          title: "Rows Deleted",
          description: `${selectedIds.length} row(s) deleted successfully.`,
        })
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete selected rows. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }, [enableBulkActions, selectedRows, onDeleteRows, localData, handleDataChange, toast, idField])

  const exportData = useCallback(
    (format: "csv" | "excel" | "pdf" = "csv") => {
      if (!enableExport) return

      const exportColumns = columns.filter((col) => visibleColumns.has(col.key))
      const timestamp = new Date().toISOString().split("T")[0]

      switch (format) {
        case "csv": {
          const csv = [
            exportColumns.map((col) => col.label).join(","),
            ...processedData.map((row) =>
              exportColumns
                .map((col) => {
                  const value = row[col.key]
                  const formatted = col.format ? col.format(value) : String(value)
                  return `"${formatted.replace(/"/g, '""')}"`
                })
                .join(","),
            ),
          ].join("\n")

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `${title.toLowerCase().replace(/\s+/g, "-")}-${timestamp}.csv`
          a.click()
          URL.revokeObjectURL(url)
          break
        }
        case "excel": {
          // Simplified Excel export (would need a library like xlsx for full functionality)
          toast({
            title: "Excel Export",
            description: "Excel export requires additional setup. Using CSV format instead.",
          })
          exportData("csv")
          break
        }
        case "pdf": {
          toast({
            title: "PDF Export",
            description: "PDF export requires additional setup. Using CSV format instead.",
          })
          exportData("csv")
          break
        }
      }
    },
    [enableExport, columns, visibleColumns, processedData, title],
  )

  const toggleColumnVisibility = useCallback((key: keyof T) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }, [])

  const startEditing = useCallback(
    (rowId: string, field: keyof T) => {
      if (!editable) return
      const column = columns.find((col) => col.key === field)
      if (!column?.editable) return

      const row = localData.find((r) => String(r[idField]) === rowId)
      if (row) {
        setEditingCell({ rowId, field })
        setEditValue(String(row[field]))
      }
    },
    [localData, columns, idField, editable],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, colIndex: number, rowId: string, field: keyof T) => {
      const visibleEditableColumns = columns.filter((col) => col.editable && visibleColumns.has(col.key))

      if (e.key === "Tab") {
        e.preventDefault()
        let nextColIndex = colIndex
        let nextRowIndex = rowIndex

        if (e.shiftKey) {
          // Navigate backwards
          nextColIndex--
          if (nextColIndex < 0) {
            nextColIndex = visibleEditableColumns.length - 1
            nextRowIndex--
          }
        } else {
          // Navigate forwards
          nextColIndex++
          if (nextColIndex >= visibleEditableColumns.length) {
            nextColIndex = 0
            nextRowIndex++
          }
        }

        if (nextRowIndex >= 0 && nextRowIndex < paginatedData.length) {
          const nextRow = paginatedData[nextRowIndex]
          const nextField = visibleEditableColumns[nextColIndex]?.key
          if (nextField) {
            const nextRowId = String(nextRow[idField])
            setFocusedCell({ rowIndex: nextRowIndex, colIndex: nextColIndex })

            // Focus the next cell
            const cellKey = `${nextRowId}-${String(nextField)}`
            const cellElement = cellRefs.current.get(cellKey)
            if (cellElement) {
              cellElement.focus()
            }
          }
        }
      } else if (e.key === "Enter" && editable) {
        if (editingCell) {
          saveCellEdit()
        } else {
          startEditing(rowId, field)
        }
      } else if (e.key === "Escape" && editingCell) {
        cancelCellEdit()
      }
    },
    [editingCell, cancelCellEdit, startEditing, paginatedData, columns, visibleColumns, idField, editable],
  )

  const saveAllChanges = useCallback(async () => {
    if (!onSave || validationErrors.length > 0) {
      if (validationErrors.length > 0) {
        toast({
          title: "Validation Errors",
          description: `Please fix ${validationErrors.length} validation error(s) before saving.`,
          variant: "destructive",
        })
      }
      return
    }

    setIsLoading(true)
    try {
      const result = await onSave(localData)
      if (result.success) {
        setHasUnsavedChanges(false)
        setLastSaved(new Date())
        toast({
          title: "Changes Saved",
          description: "All changes have been saved successfully.",
        })
      } else {
        if (result.errors) {
          setValidationErrors(result.errors)
        }
        toast({
          title: "Save Failed",
          description: "Some validation errors occurred. Please review and try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [localData, onSave, validationErrors, toast])

  const renderCell = useCallback(
    (row: T, column: TableColumn<T>, rowIndex: number, colIndex: number) => {
      if (!row) {
        return <div className="text-muted-foreground italic">-</div>
      }

      const value = row[column.key]
      const rowId = String(row[idField])
      const isEditing = editingCell?.rowId === rowId && editingCell?.field === column.key
      const cellKey = `${rowId}-${String(column.key)}`

      const hasError = validationErrors.some((error) => error.rowId === rowId && error.field === column.key)

      if (isEditing && column.editable && editable && !readOnly) {
        return (
          <div className="w-full">
            {column.type === "select" ? (
              <CustomDropdown
                value={editValue}
                options={column.options || []}
                onChange={setEditValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCellEdit()
                  if (e.key === "Escape") cancelCellEdit()
                }}
                onBlur={saveCellEdit}
                autoFocus
              />
            ) : column.type === "date" ? (
              <CustomDatePicker
                value={editValue}
                onChange={setEditValue}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCellEdit()
                  if (e.key === "Escape") cancelCellEdit()
                }}
                onBlur={saveCellEdit}
                autoFocus
              />
            ) : (
              <CustomInput
                type={column.type === "number" ? "number" : column.type === "email" ? "email" : "text"}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveCellEdit()
                  if (e.key === "Escape") cancelCellEdit()
                }}
                onBlur={saveCellEdit}
                autoFocus
              />
            )}
          </div>
        )
      }

      if (column.render) {
        return column.render(value, row, column)
      }

      let cellContent: string

      if (column.format) {
        cellContent = column.format(value)
      } else {
        switch (column.type) {
          case "date":
            cellContent = value ? new Date(value).toLocaleDateString() : ""
            break
          case "currency":
            cellContent = value ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "$0.00"
            break
          case "percentage":
            cellContent = value ? `${Number(value).toFixed(1)}%` : "0%"
            break
          case "boolean":
            cellContent = value ? "Yes" : "No"
            break
          default:
            cellContent = String(value || "")
        }
      }

      return (
        <div
          ref={(el) => {
            if (el) {
              cellRefs.current.set(cellKey, el)
            } else {
              cellRefs.current.delete(cellKey)
            }
          }}
          className={`w-full h-8 px-2 flex items-center rounded transition-colors ${
            column.editable && editable && !readOnly
              ? "cursor-pointer hover:bg-accent focus:bg-accent focus:outline-none"
              : ""
          } ${hasError ? "bg-red-50 border border-red-200" : ""}`}
          onClick={() => editable && !readOnly && startEditing(rowId, column.key)}
          onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex, rowId, column.key)}
          tabIndex={column.editable && editable && !readOnly ? 0 : -1}
          title={
            hasError ? validationErrors.find((e) => e.rowId === rowId && e.field === column.key)?.message : undefined
          }
        >
          <span
            className={`${column.type === "number" || column.type === "currency" || column.type === "percentage" ? "font-mono" : ""}`}
          >
            {cellContent}
          </span>
          {hasError && <AlertTriangle className="h-3 w-3 text-red-500 ml-1 flex-shrink-0" />}
        </div>
      )
    },
    [
      editingCell,
      editValue,
      saveCellEdit,
      cancelCellEdit,
      startEditing,
      idField,
      editable,
      readOnly,
      handleKeyDown,
      validationErrors,
    ],
  )

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key))
  const frozenColumnsArray = visibleColumnsArray.filter((col) => frozenColumns.has(col.key))
  const regularColumnsArray = visibleColumnsArray.filter((col) => !frozenColumns.has(col.key))

  const themeClasses = {
    default: "bg-background",
    industrial: "bg-slate-50 border-slate-200",
    minimal: "bg-white border-gray-100",
  }

  return (
    <Card className={`w-full ${themeClasses[theme]} ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                {icon}
                <div>
                  {title}
                  {subtitle && <div className="text-sm font-normal text-muted-foreground mt-1">{subtitle}</div>}
                </div>
              </CardTitle>
            </div>

            {enableFiltering && (
              <div className="flex gap-2 flex-wrap items-center">
                {visibleColumnsArray
                  .filter((col) => col.filterable)
                  .slice(0, 3)
                  .map((column) => (
                    <div key={String(column.key)} className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <Input
                        placeholder={`Filter ${column.label}`}
                        value={filters[String(column.key)]?.value || ""}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            [String(column.key)]: { value: e.target.value, operator: "contains" },
                          }))
                        }
                        className="pl-7 h-8 w-32 text-xs bg-background/50 border border-border/50 focus:bg-background rounded-md"
                      />
                    </div>
                  ))}

                {visibleColumnsArray.filter((col) => col.filterable).length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="h-8 px-2 text-xs"
                  >
                    <Filter className="h-3 w-3 mr-1" />
                    More
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {enableSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search all data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 w-64 bg-background/80 border-border/50 focus:bg-background focus:border-border"
                />
              </div>
            )}

            {enableColumnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9 bg-background/50">
                    <Columns className="h-4 w-4" />
                    Columns ({visibleColumns.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Column Visibility</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={String(column.key)}
                      checked={visibleColumns.has(column.key)}
                      onCheckedChange={() => toggleColumnVisibility(column.key)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{column.label}</span>
                        {frozenColumns.has(column.key) && <Pin className="h-3 w-3 text-blue-500" />}
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {enableExport && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 h-9 bg-background/50">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem onClick={() => exportData("csv")}>
                    <FileText className="h-4 w-4 mr-2" />
                    CSV File
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onClick={() => exportData("excel")}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel File
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem onClick={() => exportData("pdf")}>
                    <Printer className="h-4 w-4 mr-2" />
                    PDF Report
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {onRefresh && (
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                className="gap-2 h-9 bg-background/50"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            )}

            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                  <Clock className="h-3 w-3 mr-1" />
                  Unsaved
                </Badge>
              )}

              {validationErrors.length > 0 && (
                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {validationErrors.length} Error{validationErrors.length !== 1 ? "s" : ""}
                </Badge>
              )}

              {lastSaved && (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Saved
                </Badge>
              )}

              {readOnly && (
                <Badge variant="outline" className="text-gray-600 border-gray-200 bg-gray-50">
                  <Lock className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div
          ref={tableRef}
          className="overflow-auto border-x border-border"
          style={{ maxHeight: virtualScrolling ? "600px" : undefined }}
        >
          <table className="w-full border-collapse bg-background">
            <thead className={`${stickyHeader ? "sticky top-0 z-20" : ""} bg-muted/50 backdrop-blur-sm`}>
              <tr className="border-b-2 border-border">
                {enableRowNumbers && (
                  <th className="text-center p-2 font-semibold w-16 border-r border-border bg-muted/70 text-xs text-muted-foreground sticky left-0 z-10">
                    <div className="flex items-center justify-center gap-1">
                      <span>#</span>
                    </div>
                  </th>
                )}

                {enableSelection && (
                  <th className="text-left p-3 font-semibold w-12 border-r border-border bg-muted/70 sticky left-16 z-10">
                    <Checkbox
                      checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all rows"
                    />
                  </th>
                )}

                {visibleColumnsArray.map((column, index) => (
                  <th
                    key={String(column.key)}
                    className={`text-left p-3 font-semibold border-r border-border last:border-r-0 bg-muted/70 ${
                      column.type === "number" || column.type === "currency" || column.type === "percentage"
                        ? "text-right"
                        : ""
                    } ${frozenColumns.has(column.key) ? "sticky z-10 bg-muted/90" : ""}`}
                    style={{
                      width: column.width,
                      minWidth: column.minWidth || "120px",
                      maxWidth: column.maxWidth,
                      left: frozenColumns.has(column.key)
                        ? `${(enableRowNumbers ? 64 : 0) + (enableSelection ? 48 : 0)}px`
                        : undefined,
                    }}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        column.type === "number" || column.type === "currency" || column.type === "percentage"
                          ? "justify-end"
                          : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{column.label}</span>
                        {column.description && (
                          <span className="text-xs text-muted-foreground font-normal">{column.description}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {column.required && <span className="text-red-500 text-xs">*</span>}

                        {frozenColumns.has(column.key) && <Pin className="h-3 w-3 text-blue-500" />}

                        {enableSorting && column.sortable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted/50"
                            onClick={() => handleSort(column.key)}
                          >
                            {sortConfig?.key === column.key ? (
                              sortConfig.direction === "asc" ? (
                                <ChevronUp className="h-4 w-4 text-blue-600" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-blue-600" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-40" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, rowIndex) => {
                if (!row) {
                  return null
                }

                const rowId = String(row[idField])
                const decorations = getRowDecorations(row)
                const actualRowNumber = (currentPage - 1) * pageSize + rowIndex + 1
                const hasRowErrors = validationErrors.some((error) => error.rowId === rowId)

                return (
                  <tr
                    key={rowId}
                    className={`border-b border-border hover:bg-muted/30 transition-colors ${
                      decorations.className
                    } ${hasRowErrors ? "bg-red-50/50" : ""} ${selectedRows.has(rowId) ? "bg-blue-50/50" : ""}`}
                    style={decorations.style}
                    title={decorations.tooltip}
                  >
                    {enableRowNumbers && (
                      <td className="p-2 text-center border-r border-border bg-muted/20 text-xs text-muted-foreground font-mono sticky left-0 z-10">
                        <div className="flex items-center justify-center">
                          {actualRowNumber}
                          {hasRowErrors && <AlertTriangle className="h-3 w-3 text-red-500 ml-1" />}
                        </div>
                      </td>
                    )}

                    {enableSelection && (
                      <td className="p-3 border-r border-border bg-background/50 sticky left-16 z-10">
                        <Checkbox
                          checked={selectedRows.has(rowId)}
                          onCheckedChange={() => toggleRowSelection(rowId)}
                          aria-label={`Select row ${rowId}`}
                        />
                      </td>
                    )}

                    {visibleColumnsArray.map((column, colIndex) => (
                      <td
                        key={String(column.key)}
                        className={`p-3 border-r border-border last:border-r-0 ${
                          column.type === "number" || column.type === "currency" || column.type === "percentage"
                            ? "text-right"
                            : ""
                        } ${frozenColumns.has(column.key) ? "sticky z-10 bg-background/90" : ""}`}
                        style={{
                          left: frozenColumns.has(column.key)
                            ? `${(enableRowNumbers ? 64 : 0) + (enableSelection ? 48 : 0)}px`
                            : undefined,
                        }}
                      >
                        {renderCell(row, column, rowIndex, colIndex)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>

            {showAggregations && Object.keys(aggregations).length > 0 && (
              <tfoot className="bg-muted/70 border-t-2 border-border sticky bottom-0">
                <tr>
                  {enableRowNumbers && (
                    <td className="p-2 text-center border-r border-border font-semibold text-xs sticky left-0 z-10 bg-muted/70">
                      Σ
                    </td>
                  )}
                  {enableSelection && <td className="p-3 border-r border-border sticky left-16 z-10 bg-muted/70"></td>}
                  {visibleColumnsArray.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`p-3 border-r border-border last:border-r-0 font-semibold ${
                        column.type === "number" || column.type === "currency" || column.type === "percentage"
                          ? "text-right"
                          : ""
                      } ${frozenColumns.has(column.key) ? "sticky z-10 bg-background/90" : ""}`}
                      style={{
                        left: frozenColumns.has(column.key)
                          ? `${(enableRowNumbers ? 64 : 0) + (enableSelection ? 48 : 0)}px`
                          : undefined,
                      }}
                    >
                      {aggregations[String(column.key)] !== undefined && (
                        <span className="text-sm font-mono">
                          {column.type === "currency"
                            ? `$${aggregations[String(column.key)].toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : aggregations[String(column.key)].toLocaleString()}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {processedData.length === 0 && (
          <div className="text-center py-16 text-muted-foreground border-x border-b border-border bg-muted/10">
            <div className="text-lg font-semibold mb-2">No Data Available</div>
            <div className="text-sm">
              {searchTerm || Object.values(filters).some((f) => f.value)
                ? "No results found. Try adjusting your search or filters."
                : 'No data available. Click "Add Row" to get started.'}
            </div>
          </div>
        )}

        {enableStatusBar && (
          <div className="border-x border-b border-border bg-muted/20 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {onAddRow && !readOnly && (
                  <Button onClick={addNewRow} size="sm" variant="default" className="gap-2 h-9 shadow-sm font-semibold">
                    <Plus className="h-4 w-4" />
                    Add Row
                  </Button>
                )}

                {enableBulkActions && selectedRows.size > 0 && !readOnly && (
                  <Button
                    onClick={deleteSelectedRows}
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30 bg-background font-semibold"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete ({selectedRows.size})
                  </Button>
                )}

                {onSave && hasUnsavedChanges && !readOnly && (
                  <Button
                    onClick={saveAllChanges}
                    size="sm"
                    disabled={isLoading || validationErrors.length > 0}
                    className="gap-2 h-9 bg-green-600 hover:bg-green-700 shadow-sm font-semibold"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save All Changes
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm">
                {selectedRows.size > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-semibold">
                      {selectedRows.size} of {processedData.length} selected
                    </span>
                  </div>
                )}

                <div className="text-muted-foreground font-mono">
                  Showing {Math.min((currentPage - 1) * pageSize + 1, processedData.length)}–
                  {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} rows
                </div>

                {lastSaved && (
                  <div className="text-muted-foreground text-xs">Last saved: {lastSaved.toLocaleTimeString()}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="border-x border-b border-border bg-background px-6 py-4">
            <div className="flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  First
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
                >
                  Previous
                </Button>
                <span className="px-4 py-2 text-sm font-mono bg-muted/50 rounded border">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8"
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
