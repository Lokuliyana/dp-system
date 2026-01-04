"use client"

import { useQuery } from "@tanstack/react-query"
import { permissionService } from "@/services/masterdata/permission.service"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Badge,
  Input,
} from "@/components/ui"
import { Search, Lock, Info, Loader2 } from "lucide-react"
import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic"

export default function PermissionsPage() {
  const { data: permissionsData, isLoading } = useQuery({
    queryKey: ["permissions"],
    queryFn: permissionService.listPermissions,
  })

  const [searchTerm, setSearchTerm] = useState("")

  const hierarchy = permissionsData?.reconstructedHigherarchy || {}

  const filteredHierarchy = useMemo(() => {
    if (!searchTerm) return hierarchy
    
    const filtered: any = {}
    Object.entries(hierarchy).forEach(([moduleName, features]: [string, any]) => {
      const filteredFeatures: any = {}
      let hasMatch = moduleName.toLowerCase().includes(searchTerm.toLowerCase())

      Object.entries(features).forEach(([featureName, actions]: [string, any]) => {
        const matchesFeature = featureName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchingActions = actions.filter((a: string) => a.toLowerCase().includes(searchTerm.toLowerCase()))
        
        if (matchesFeature || matchingActions.length > 0 || hasMatch) {
          filteredFeatures[featureName] = actions
          hasMatch = true
        }
      })

      if (hasMatch) {
        filtered[moduleName] = filteredFeatures
      }
    })
    return filtered
  }, [hierarchy, searchTerm])

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <DynamicPageHeader
        title="Permission Explorer"
        subtitle="Browse available system permissions."
        icon={Lock}
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search permissions..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="h-3.5 w-3.5" />
            <span>Permissions are structured as <code>module.feature.action</code></span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filteredHierarchy).map(([moduleName, features]: [string, any]) => (
              <Card key={moduleName} className="h-full">
                <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      {moduleName}
                    </CardTitle>
                    <Badge variant="outline" className="text-[9px] font-normal">
                      {Object.keys(features).length} Features
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {Object.entries(features).map(([featureName, actions]: [string, any]) => (
                    <div key={featureName} className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{featureName}</span>
                      <div className="flex flex-wrap gap-1">
                        {actions.map((action: string) => (
                          <Badge 
                            key={action} 
                            variant="secondary" 
                            className="text-[9px] px-1.5 py-0 font-normal"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && Object.keys(filteredHierarchy).length === 0 && (
          <div className="text-center py-20 text-slate-500">
            No permissions found matching your search.
          </div>
        )}
      </div>
    </LayoutController>
  )
}
