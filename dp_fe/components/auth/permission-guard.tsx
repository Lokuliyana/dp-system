import { usePermission } from "@/hooks/usePermission"
import { ReactNode } from "react"

interface PermissionGuardProps {
  permission: string | string[]
  children: ReactNode
  fallback?: ReactNode
  requireAll?: boolean
}

export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null,
  requireAll = true 
}: PermissionGuardProps) {
  const { can, canAll, canAny } = usePermission()

  let hasAccess = false

  if (Array.isArray(permission)) {
    hasAccess = requireAll ? canAll(permission) : canAny(permission)
  } else {
    hasAccess = can(permission)
  }

  if (!hasAccess) return <>{fallback}</>

  return <>{children}</>
}
