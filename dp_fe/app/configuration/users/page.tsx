"use client"

import { useState } from "react"
import { useAppUsers, useCreateAppUser, useUpdateAppUser, useDeleteAppUser } from "@/hooks/useAuth"
import { PermissionSelector } from "@/components/auth/permission-selector"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Switch,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui"
import { Plus, Pencil, Trash2, Shield, Search } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import type { AppUser } from "@/types/models"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  roleId: z.string().min(1, "Role is required"), // We might need to fetch roles too
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
})

type UserFormValues = z.infer<typeof userSchema>

export default function UsersPage() {
  const { data: users, isLoading } = useAppUsers()
  const createUser = useCreateAppUser()
  const updateUser = useUpdateAppUser()
  const deleteUser = useDeleteAppUser()

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AppUser | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roleId: "658d557335602e001f300002", // TODO: Fetch roles and use a select. Hardcoded for now or need a role selector.
      isActive: true,
      permissions: [],
    },
  })

  const onSubmit = (data: UserFormValues) => {
    const payload = {
      ...data,
      // If editing and password is empty, remove it so it doesn't overwrite
      password: data.password || undefined, 
    }

    if (editingUser) {
      updateUser.mutate({ id: editingUser.id, payload }, {
        onSuccess: () => {
          toast.success("User updated successfully")
          setIsSheetOpen(false)
          setEditingUser(null)
          form.reset()
        },
        onError: (err) => toast.error("Failed to update user")
      })
    } else {
      if (!data.password) {
        toast.error("Password is required for new users")
        return
      }
      // Need to ensure password is string
      createUser.mutate({ ...data, password: data.password! }, {
        onSuccess: () => {
          toast.success("User created successfully")
          setIsSheetOpen(false)
          form.reset()
        },
        onError: (err) => toast.error("Failed to create user")
      })
    }
  }

  const handleEdit = (user: AppUser) => {
    setEditingUser(user)
    form.reset({
      name: user.fullName || "", // API returns fullName? Type says fullName.
      email: user.email,
      password: "",
      roleId: "658d557335602e001f300002", // Placeholder
      isActive: user.isActive,
      permissions: user.permissions || [],
    })
    setIsSheetOpen(true)
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.reset({
      name: "",
      email: "",
      password: "",
      roleId: "658d557335602e001f300002",
      isActive: true,
      permissions: [],
    })
    setIsSheetOpen(true)
  }

  const filteredUsers = users?.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                </TableRow>
              ) : filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100">
                      {(user.permissions?.length || 0)} Custom
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingUser ? "Edit User" : "Create User"}</SheetTitle>
            <SheetDescription>
              Configure user details and granular permissions.
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  value={form.watch("name")} 
                  onChange={(e) => form.setValue("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  value={form.watch("email")} 
                  onChange={(e) => form.setValue("email", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password {editingUser && "(Leave blank to keep current)"}</Label>
                <Input 
                  type="password"
                  value={form.watch("password")} 
                  onChange={(e) => form.setValue("password", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Switch 
                  checked={form.watch("isActive")}
                  onCheckedChange={(c) => form.setValue("isActive", c)}
                />
                <Label>Active Account</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="rounded-md border p-4 bg-slate-50/50">
                <PermissionSelector 
                  selected={form.watch("permissions")}
                  onChange={(perms) => form.setValue("permissions", perms)}
                />
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(onSubmit)}>Save Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
