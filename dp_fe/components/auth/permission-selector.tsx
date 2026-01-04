"use client"

import { useQuery } from "@tanstack/react-query"
import { permissionService } from "@/services/masterdata/permission.service"
import { 
  Checkbox, 
  Label, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Button, 
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { Loader2, Shield, CheckCircle2, Circle } from "lucide-react"
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

  const actionsList = ["create", "read", "update", "delete"]

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Permission Matrix</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">Configure granular access levels</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChange([])}
          className="text-xs h-8 rounded-lg"
        >
          Reset All
        </Button>
      </div>

      <ScrollArea className="h-[650px] pr-4">
        <div className="space-y-8">
          {Object.entries(hierarchy).map(([moduleName, features]: [string, any]) => {
            const modulePerms = getModulePermissions(moduleName, features)
            const allModuleSelected = modulePerms.every(p => selected.includes(p))
            const someModuleSelected = modulePerms.some(p => selected.includes(p))

            return (
              <div key={moduleName} className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary/30 rounded-full" />
                    {moduleName.replace(/_/g, " ")}
                  </h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] font-bold uppercase tracking-tight hover:bg-primary/5 hover:text-primary"
                    onClick={() => handleGroupToggle(modulePerms)}
                  >
                    {allModuleSelected ? "Deselect Module" : "Select Module"}
                  </Button>
                </div>

                <Card className="border-slate-200 shadow-none overflow-hidden rounded-xl">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[240px] text-[10px] font-bold uppercase text-slate-500 py-3">Feature</TableHead>
                        {actionsList.map(action => (
                          <TableHead key={action} className="text-center text-[10px] font-bold uppercase text-slate-500 py-3">{action}</TableHead>
                        ))}
                        <TableHead className="text-center text-[10px] font-bold uppercase text-slate-500 py-3">Full Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.entries(features).map(([featureName, actions]: [string, any]) => {
                        const featurePerms = getFeaturePermissions(moduleName, featureName, actions)
                        const allFeatureSelected = featurePerms.every(p => selected.includes(p))
                        
                        return (
                          <TableRow key={featureName} className="hover:bg-slate-50/30 border-slate-100">
                            <TableCell className="py-3">
                              <span className="text-xs font-semibold text-slate-700">{featureName.replace(/_/g, " ")}</span>
                            </TableCell>
                            {actionsList.map(action => {
                              const permString = `${moduleName.toLowerCase()}.${featureName.toLowerCase()}.${action.toLowerCase()}`
                              const exists = actions.includes(action)
                              return (
                                <TableCell key={action} className="text-center py-3">
                                  {exists ? (
                                    <Checkbox 
                                      checked={selected.includes(permString)}
                                      onCheckedChange={() => handleToggle(permString)}
                                      className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                  ) : (
                                    <div className="h-4 w-4 mx-auto rounded border border-slate-100 bg-slate-50/50" />
                                  )}
                                </TableCell>
                              )
                            })}
                            <TableCell className="text-center py-3">
                              <div className="flex justify-center">
                                <Checkbox 
                                  checked={allFeatureSelected}
                                  onCheckedChange={() => handleGroupToggle(featurePerms)}
                                  className="h-4 w-4 rounded-full border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
