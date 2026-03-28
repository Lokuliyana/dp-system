"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/hooks/useAuth"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input,
  Label,
  Badge,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { Plus, Pencil, Shield, Search, Trash2, Key, Info, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { Role } from "@/types/models"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic"
import { DeleteConfirmationModal } from "@/components/reusable"
import { PermissionSelector } from "@/components/auth/permission-selector"
import { usePermission } from "@/hooks/usePermission"
import { PermissionGuard } from "@/components/auth/permission-guard"

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

type RoleFormValues = z.infer<typeof roleSchema>

export default function RolesPage() {
  const router = useRouter()
  const { data: roles, isLoading } = useRoles()
  const deleteRole = useDeleteRole()
  const { can } = usePermission()

  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const handleCreate = () => {
    router.push("/users/roles/new")
  }

  const filteredRoles = useMemo(() => {
    return roles?.filter(r => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [roles, searchTerm])

  return (
    <PermissionGuard permission="system.role.read">
      <LayoutController showMainMenu showHorizontalToolbar>
      <DynamicPageHeader
        title="System Roles"
        subtitle="Define access levels and assign default permissions."
        icon={Shield}
        actions={
          <PermissionGuard permission="system.role.create">
            <Button 
              onClick={handleCreate}
              className="gap-2"
            >
              <Plus className="h-4 w-4" /> Add Role
            </Button>
          </PermissionGuard>
        }
      />

        <div className="p-4 sm:p-6 space-y-6">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search roles..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                Access Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Permissions</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10">
                            <div className="flex items-center justify-center gap-2 text-slate-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading roles...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredRoles?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                            No roles found.
                          </TableCell>
                        </TableRow>
                      ) : filteredRoles?.map((role) => (
                        <motion.tr
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          key={role.id}
                          className="cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => router.push(`/users/roles/${role.id}`)}
                        >
                          <TableCell className="font-semibold text-sm group-hover:text-primary transition-colors">{role.name}</TableCell>
                          <TableCell className="text-xs text-slate-500">{role.description || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[9px]">
                              {role.permissions?.length || 0} Permissions
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <PermissionGuard permission="system.role.update">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => router.push(`/users/roles/${role.id}`)}
                                >
                                  <Pencil className="h-4 w-4 text-slate-400" />
                                </Button>
                              </PermissionGuard>
                              <PermissionGuard permission="system.role.delete">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => setRoleToDelete(role.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                </Button>
                              </PermissionGuard>
                            </div>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeleteConfirmationModal
          isOpen={!!roleToDelete}
          onClose={() => setRoleToDelete(null)}
          onConfirm={() => roleToDelete && deleteRole.mutate(roleToDelete, { onSuccess: () => setRoleToDelete(null) })}
          itemName="this role"
          isLoading={deleteRole.isPending}
        />
      </LayoutController>
    </PermissionGuard>
  )
}
