"use client"

import { useQuery } from "@tanstack/react-query"
import { permissionService } from "@/services/masterdata/permission.service"
import { Checkbox, Label, Card, CardHeader, CardTitle, CardContent, Button, ScrollArea, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PermissionSelectorProps {
  selected: string[]
  onChange: (permissions: string[]) => void
  className?: string
}

export function PermissionSelector({ selected, onChange, className }: PermissionSelectorProps) {
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.listPermissions,
  })

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>
  }

  if (!permissionsData || !permissionsData.reconstructedHigherarchy) {
    return <div className="text-red-500">Failed to load permissions</div>
  }

  const hierarchy = permissionsData.reconstructedHigherarchy

  const handleToggle = (perm: string) => {
    if (selected.includes(perm)) {
      onChange(selected.filter(p => p !== perm))
    } else {
      onChange([...selected, perm])
    }
  }

  const getModulePermissions = (moduleName: string, features: any) => {
    const perms: string[] = []
    Object.entries(features).forEach(([featureName, actions]: [string, any]) => {
      actions.forEach((action: string) => {
        perms.push(`${moduleName.toLowerCase()}.${featureName.toLowerCase()}.${action.toLowerCase()}`)
      })
    })
    return perms
  }

  const getFeaturePermissions = (moduleName: string, featureName: string, actions: string[]) => {
    return actions.map(action => `${moduleName.toLowerCase()}.${featureName.toLowerCase()}.${action.toLowerCase()}`)
  }

  const handleGroupToggle = (perms: string[]) => {
    const allSelected = perms.every(p => selected.includes(p))
    if (allSelected) {
      onChange(selected.filter(p => !perms.includes(p)))
    } else {
      const newSelected = [...selected]
      perms.forEach(p => {
        if (!newSelected.includes(p)) newSelected.push(p)
      })
      onChange(newSelected)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Access Control</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChange([])}
        >
          Clear All
        </Button>
      </div>

      <ScrollArea className="h-[600px] pr-4">
        <div className="grid grid-cols-1 gap-4">
          {Object.entries(hierarchy).map(([moduleName, features]: [string, any]) => {
            const modulePerms = getModulePermissions(moduleName, features)
            const allModuleSelected = modulePerms.every(p => selected.includes(p))
            const someModuleSelected = modulePerms.some(p => selected.includes(p))

            return (
              <Card key={moduleName} className={cn("border-slate-200 shadow-sm", allModuleSelected && "border-primary/50 bg-primary/5")}>
                <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between space-y-0 bg-slate-50/50 border-b">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700">
                    {moduleName.replace(/_/g, " ")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground font-normal">Select All</Label>
                    <Checkbox 
                      checked={allModuleSelected || (someModuleSelected && "indeterminate")}
                      onCheckedChange={() => handleGroupToggle(modulePerms)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(features).map(([featureName, actions]: [string, any]) => {
                      const featurePerms = getFeaturePermissions(moduleName, featureName, actions)
                      const allFeatureSelected = featurePerms.every(p => selected.includes(p))
                      
                      return (
                        <div key={featureName} className="space-y-3">
                          <div className="flex items-center justify-between border-b pb-1">
                            <span className="text-xs font-semibold text-slate-600 uppercase">{featureName.replace(/_/g, " ")}</span>
                            <Checkbox 
                              className="h-3 w-3"
                              checked={allFeatureSelected || (featurePerms.some(p => selected.includes(p)) && "indeterminate")}
                              onCheckedChange={() => handleGroupToggle(featurePerms)}
                            />
                          </div>
                          <div className="space-y-2 pl-1">
                            {actions.map((action: string) => {
                              const permString = `${moduleName.toLowerCase()}.${featureName.toLowerCase()}.${action.toLowerCase()}`
                              return (
                                <div key={permString} className="flex items-center space-x-2">
                                  <Checkbox 
                                    id={permString} 
                                    checked={selected.includes(permString)}
                                    onCheckedChange={() => handleToggle(permString)}
                                  />
                                  <Label 
                                    htmlFor={permString} 
                                    className="text-xs font-medium leading-none cursor-pointer text-slate-600"
                                  >
                                    {action}
                                  </Label>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
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
