"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { permissionService } from "@/services/masterdata/permission.service"
import { Checkbox, Label, Card, CardHeader, CardTitle, CardContent, Button, ScrollArea, Badge } from "@/components/ui"
import { Loader2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PermissionSelectorProps {
  selected: string[]
  onChange: (permissions: string[]) => void
  className?: string
}

export function PermissionSelector({ selected, onChange, className }: PermissionSelectorProps) {
  const { data: permissionsMap, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.listPermissions,
  })

  // Local state for optimistic updates or just easier handling
  // But we can just use props.

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  }

  if (!permissionsMap) {
    return <div className="text-red-500">Failed to load permissions</div>
  }

  const handleToggle = (perm: string) => {
    if (selected.includes(perm)) {
      onChange(selected.filter(p => p !== perm))
    } else {
      onChange([...selected, perm])
    }
  }

  const handleGroupToggle = (groupPerms: string[]) => {
    const allSelected = groupPerms.every(p => selected.includes(p))
    if (allSelected) {
      // Deselect all
      onChange(selected.filter(p => !groupPerms.includes(p)))
    } else {
      // Select all
      const newSelected = [...selected]
      groupPerms.forEach(p => {
        if (!newSelected.includes(p)) newSelected.push(p)
      })
      onChange(newSelected)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Access Control</h3>
        <div className="flex gap-2">
           <Button 
            variant="outline" 
            size="sm"
            onClick={() => onChange([])}
          >
            Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(permissionsMap).map(([groupKey, groupPerms]) => {
            const perms = Object.values(groupPerms)
            const allSelected = perms.every(p => selected.includes(p))
            const someSelected = perms.some(p => selected.includes(p))

            return (
              <Card key={groupKey} className={cn("border-slate-200 shadow-sm transition-all hover:shadow-md", allSelected && "border-primary/50 bg-primary/5")}>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {groupKey.replace(/_/g, " ")}
                  </CardTitle>
                  <Checkbox 
                    checked={allSelected || (someSelected && "indeterminate")}
                    onCheckedChange={() => handleGroupToggle(perms)}
                  />
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2">
                  <div className="space-y-2">
                    {Object.entries(groupPerms).map(([key, value]) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={value} 
                          checked={selected.includes(value)}
                          onCheckedChange={() => handleToggle(value)}
                        />
                        <Label 
                          htmlFor={value} 
                          className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {key}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
