"use client"

import { useState, useMemo } from "react"
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

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
})

type RoleFormValues = z.infer<typeof roleSchema>

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  })

  const onSubmit = (data: RoleFormValues) => {
    if (editingRole) {
      updateRole.mutate({ id: editingRole.id, payload: data }, {
        onSuccess: () => {
          toast.success("Role updated successfully")
          setIsSheetOpen(false)
          setEditingRole(null)
          form.reset()
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update role")
        }
      })
    } else {
      createRole.mutate(data, {
        onSuccess: () => {
          toast.success("Role created successfully")
          setIsSheetOpen(false)
          form.reset()
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to create role")
        }
      })
    }
  }

  const handleEdit = (role: Role) => {
    setEditingRole(role)
    form.reset({
      name: role.name,
      description: role.description || "",
      permissions: role.permissions || [],
    })
    setIsSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingRole(null)
    form.reset({
      name: "",
      description: "",
      permissions: [],
    })
    setIsSheetOpen(true)
  }

  const filteredRoles = useMemo(() => {
    return roles?.filter(r => 
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [roles, searchTerm])

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <DynamicPageHeader
        title="System Roles"
        subtitle="Define access levels and assign default permissions."
        icon={Shield}
        actions={
          <Button 
            onClick={handleCreate}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add Role
          </Button>
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
                      >
                        <TableCell className="font-semibold text-sm">{role.name}</TableCell>
                        <TableCell className="text-xs text-slate-500">{role.description || "-"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[9px]">
                            {role.permissions?.length || 0} Permissions
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(role)}
                            >
                              <Pencil className="h-4 w-4 text-slate-400" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setRoleToDelete(role.id)}
                            >
                              <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                            </Button>
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

      {/* Role Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingRole ? "Edit Role" : "Create Role"}</SheetTitle>
            <SheetDescription>
              Configure the role details and default permissions.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input 
                  placeholder="e.g. Administrator"
                  value={form.watch("name")} 
                  onChange={(e) => form.setValue("name", e.target.value)}
                />
                {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input 
                  placeholder="Role description..."
                  value={form.watch("description")} 
                  onChange={(e) => form.setValue("description", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-sm font-semibold">Default Permissions</Label>
              <PermissionSelector 
                selected={form.watch("permissions")}
                onChange={(perms) => form.setValue("permissions", perms)}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)}>
              {editingRole ? "Update Role" : "Create Role"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <DeleteConfirmationModal
        isOpen={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        onConfirm={() => roleToDelete && deleteRole.mutate(roleToDelete, { onSuccess: () => setRoleToDelete(null) })}
        itemName="this role"
        isLoading={deleteRole.isPending}
      />
    </LayoutController>
  )
}
