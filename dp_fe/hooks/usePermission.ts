import { useCurrentUser } from "@/hooks/useAuth"

export function usePermission() {
  const { data: user } = useCurrentUser()

  const can = (permission: string) => {
    if (!user) return false
    
    // Check if user is superadmin (either via explicit role property or by checking roles)
    const isSuperAdmin = user.role === 'superadmin' || 
      (user.roleIds as any[])?.some(r => (typeof r === 'object' ? r.name : r) === 'superadmin')

    if (isSuperAdmin) return true
    
    const hasPermission = user.permissions?.includes(permission) ?? false
    
    // Debug logging (optional, can be removed after verification)
    // console.log(`[PermissionCheck] ${permission}: ${hasPermission}`, { userPermissions: user.permissions });
    
    return hasPermission
  }

  const canAll = (permissions: string[]) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    return permissions.every(p => user.permissions?.includes(p))
  }

  const canAny = (permissions: string[]) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    return permissions.some(p => user.permissions?.includes(p))
  }

  return { can, canAll, canAny, user }
}
