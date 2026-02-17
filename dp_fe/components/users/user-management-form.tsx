"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input, 
  Label, 
  Switch, 
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui"
import { PermissionSelector } from "@/components/auth/permission-selector"
import { useRoles, useCreateAppUser, useUpdateAppUser } from "@/hooks/useAuth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { User, Shield, Key, Save, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import type { AppUser } from "@/types/models"
import { cn } from "@/lib/utils"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  roleId: z.string().min(1, "Role is required"),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"],
})

type UserFormValues = z.infer<typeof userSchema>

interface UserManagementFormProps {
  initialData?: AppUser | null
  isEditing?: boolean
}

export function UserManagementForm({ initialData, isEditing = false }: UserManagementFormProps) {
  const router = useRouter()
  const { data: roles, isLoading: isRolesLoading } = useRoles()
  const createUser = useCreateAppUser()
  const updateUser = useUpdateAppUser()

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      roleId: "",
      isActive: true,
      permissions: [],
    },
  })

  useEffect(() => {
    if (initialData) {
      const firstRole = initialData.roleIds?.[0];
      const safeRoleId = typeof firstRole === 'object' 
        ? String((firstRole as any).id || (firstRole as any)._id || "")
        : String(firstRole || "");

      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        password: "",
        roleId: safeRoleId,
        isActive: initialData.isActive,
        permissions: initialData.permissions || [],
      })
    }
  }, [initialData, form])

  const onSubmit = (data: UserFormValues) => {
    const payload = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      password: data.password || undefined,
      roleIds: [data.roleId],
    }

    if (isEditing && initialData) {
      updateUser.mutate({ id: initialData.id, payload }, {
        onSuccess: () => {
          toast.success("User updated successfully")
          router.push("/users")
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to update user")
        }
      })
    } else {
      if (!data.password) {
        toast.error("Password is required for new users")
        return
      }
      createUser.mutate({ ...payload, password: data.password! }, {
        onSuccess: () => {
          toast.success("User created successfully")
          router.push("/users")
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || "Failed to create user")
        }
      })
    }
  }

  const isLoading = createUser.isPending || updateUser.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit User Profile" : "Register New User"}
            </h1>
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={isLoading}
          className="gap-2 shadow-sm"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isEditing ? "Save Changes" : "Create User"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input 
                    placeholder="John Doe"
                    {...form.register("name")}
                  />
                  {form.formState.errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    placeholder="john@example.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {form.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="+94 7X XXX XXXX"
                    {...form.register("phone")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password {isEditing && "(Leave blank to keep current)"}</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    {...form.register("password")}
                  />
                  {form.formState.errors.password && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" /> {form.formState.errors.password.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles & Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Access Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary/30 rounded-full" />
                    System Role
                  </Label>
                </div>
                
                <Card className="border-slate-200 shadow-none overflow-hidden rounded-xl">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-bold uppercase text-slate-500 py-3">Role Name</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase text-slate-500 py-3">Description</TableHead>
                        <TableHead className="text-center text-[10px] font-bold uppercase text-slate-500 py-3">Select</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isRolesLoading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading roles...
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : roles?.map((role) => {
                        const isSelected = String(form.watch("roleId")) === String(role.id)
                        return (
                          <TableRow 
                            key={role.id} 
                            className={cn(
                              "hover:bg-slate-50/30 border-slate-100 cursor-pointer transition-colors",
                              isSelected && "bg-primary/[0.02]"
                            )}
                            onClick={() => form.setValue("roleId", String(role.id))}
                          >
                            <TableCell className="py-3">
                              <span className="text-xs font-semibold text-slate-700">{role.name}</span>
                            </TableCell>
                            <TableCell className="py-3">
                              <span className="text-[10px] text-slate-500">{role.description || "No description provided"}</span>
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <div className="flex justify-center">
                                <div className={cn(
                                  "h-4 w-4 rounded-full border flex items-center justify-center transition-all",
                                  isSelected 
                                    ? "bg-primary border-primary text-white shadow-sm" 
                                    : "bg-white border-slate-300"
                                )}>
                                  {isSelected && <div className="h-1.5 w-1.5 bg-white rounded-full" />}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </Card>
                {form.formState.errors.roleId && <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {form.formState.errors.roleId.message}</p>}
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm font-semibold mb-4 block">Custom Permissions</Label>
                <PermissionSelector 
                  selected={form.watch("permissions")}
                  onChange={(perms) => form.setValue("permissions", perms)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Active</span>
                  <p className="text-[10px] text-slate-500">Enable system access</p>
                </div>
                <Switch 
                  checked={form.watch("isActive")}
                  onCheckedChange={(c) => form.setValue("isActive", c)}
                />
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Permissions</span>
                  <Badge variant="secondary" className="text-[10px]">{form.watch("permissions")?.length || 0} Custom</Badge>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Role</span>
                  <Badge variant="secondary" className="text-[10px]">{form.watch("roleId") ? "Assigned" : "None"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
