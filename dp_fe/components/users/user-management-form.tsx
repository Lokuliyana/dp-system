"use client"

import { useEffect, useState } from "react"
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
import { VerticalToolbar } from "@/components/layout/dynamic"
import { PermissionSelector } from "@/components/auth/permission-selector"
import { useRoles, useCreateAppUser, useUpdateAppUser } from "@/hooks/useAuth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { User, Shield, Key, Save, ArrowLeft, Loader2, AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import type { AppUser } from "@/types/models"
import { cn } from "@/lib/utils"

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  confirmPassword: z.string().optional().or(z.literal("")),
  roleId: z.string().min(1, "Role is required"),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided",
  path: ["email"],
}).refine(data => {
  if (!data.password) return true
  return data.password.length >= 6
}, {
  message: "Password must be at least 6 characters",
  path: ["password"],
}).refine(data => {
  if (!data.password) return true
  return data.password === data.confirmPassword
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
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

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [activeTab, setActiveTab ] = useState<"basic" | "access" | "security">("basic")

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      roleId: "",
      isActive: true,
      permissions: [],
    },
  })

  const { reset } = form

  useEffect(() => {
    if (initialData) {
      const roleFromIds = initialData.roleIds?.[0]
      const roleIdFromIds = typeof roleFromIds === "object"
        ? (roleFromIds as any).id || (roleFromIds as any)._id
        : roleFromIds

      const safeRoleId = String(roleIdFromIds || (initialData as any).roleId || "")

      reset({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        password: "",
        confirmPassword: "",
        roleId: safeRoleId,
        isActive: initialData.isActive,
        permissions: initialData.permissions || [],
      })
    }
  }, [initialData, reset])

  const onSubmit = (data: UserFormValues) => {
    const payload = {
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      password: data.password || undefined,
      roleIds: [data.roleId],
      isActive: data.isActive,
      permissions: data.permissions,
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
      <VerticalToolbar>
        <Button
          variant="ghost"
          size="icon"
          title="Basic Info"
          onClick={() => setActiveTab("basic")}
          className={cn(activeTab === "basic" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <User className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Access Permission"
          onClick={() => setActiveTab("access")}
          className={cn(activeTab === "access" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <Shield className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Security"
          onClick={() => setActiveTab("security")}
          className={cn(activeTab === "security" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <Key className="h-4 w-4" />
        </Button>
      </VerticalToolbar>

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
        <div className="lg:col-span-3">
          {activeTab === "basic" && (
            <div className="space-y-6">
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
                      {form.formState.errors.name && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        placeholder="john@example.com"
                        {...form.register("email")}
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {form.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        placeholder="+94 7X XXX XXXX"
                        {...form.register("phone")}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "access" && (
            <div className="space-y-6">
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
                            const currentRoleId = form.watch("roleId")
                            const roleId = role.id || (role as any)._id
                            const isSelected = !!roleId && String(currentRoleId) === String(roleId)
                            return (
                              <TableRow
                                key={String(roleId)}
                                className={cn(
                                  "hover:bg-slate-50/30 border-slate-100 cursor-pointer transition-colors",
                                  isSelected && "bg-primary/[0.02]"
                                )}
                                onClick={() => form.setValue("roleId", String(roleId), { shouldDirty: true })}
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
                    {form.formState.errors.roleId && (
                      <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" /> {form.formState.errors.roleId.message}
                      </p>
                    )}
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
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Password */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    {isEditing ? "Reset Password" : "Set Password"}
                  </CardTitle>
                  {isEditing && (
                    <p className="text-xs text-slate-500 mt-1">Leave blank to keep the current password.</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isEditing ? "New Password" : "Password"}</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...form.register("password")}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {form.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...form.register("confirmPassword")}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> {form.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
