"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Loader2, Key } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { Card, CardContent, Button, Input, Label } from "@/components/ui";
import { useRoles, useCreateRole, useUpdateRole } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { PermissionSelector } from "@/components/auth/permission-selector";
import { PermissionGuard } from "@/components/auth/permission-guard";

const roleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).default([]),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function SystemRoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const isNew = id === "new";
  
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const editingRole = roles.find(r => r.id === id);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      permissions: [],
    },
  });

  useEffect(() => {
    if (editingRole) {
      form.reset({
        name: editingRole.name,
        description: editingRole.description || "",
        permissions: editingRole.permissions || [],
      });
    }
  }, [editingRole, form]);

  const onSubmit = (data: RoleFormValues) => {
    if (!isNew && id) {
      updateRole.mutate({ id, payload: data }, {
        onSuccess: () => {
          toast.success("Role updated successfully");
          router.push("/users/roles");
        },
      });
    } else {
      createRole.mutate(data, {
        onSuccess: () => {
          toast.success("Role created successfully");
          router.push("/users/roles");
        },
      });
    }
  };

  if (!isNew && isLoadingRoles) {
    return (
      <LayoutController showMainMenu showHorizontalToolbar>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LayoutController>
    );
  }

  return (
    <PermissionGuard permission="system.role.read">
      <LayoutController showMainMenu showHorizontalToolbar>
        <DynamicPageHeader
          title={isNew ? "Create New Role" : `Edit Role: ${editingRole?.name}`}
          subtitle="Define access levels and assign default permissions."
          icon={Shield}
          actions={
            <Button variant="ghost" size="sm" onClick={() => router.push("/users/roles")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
          }
        />

        <div className="p-6">
          <Card>
            <CardContent className="p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input 
                      placeholder="e.g. Administrator"
                      {...form.register("name")}
                    />
                    {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input 
                      placeholder="Role description..."
                      {...form.register("description")}
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

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => router.push("/users/roles")}>Cancel</Button>
                  <Button onClick={form.handleSubmit(onSubmit)} disabled={createRole.isPending || updateRole.isPending}>
                    {(createRole.isPending || updateRole.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isNew ? "Create Role" : "Update Role"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </LayoutController>
    </PermissionGuard>
  );
}
