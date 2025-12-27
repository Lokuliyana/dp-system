import { useCurrentUser } from "@/hooks/useAuth"

export function usePermission() {
  const { data: user } = useCurrentUser()

  const can = (permission: string) => {
    if (!user) return false
    if (user.role === 'superadmin') return true
    return user.permissions?.includes(permission) ?? false
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
