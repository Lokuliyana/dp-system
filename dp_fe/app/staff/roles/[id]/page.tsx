"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ArrowLeft, Loader2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Card, CardContent, Button } from "@/components/ui";
import { StaffRoleForm } from "@/components/staff/StaffRoleForm";
import { useStaffRoles, useCreateStaffRole, useUpdateStaffRole } from "@/hooks/useStaffRoles";
import { CreateStaffRolePayload } from "@/services/masterdata/staffRoles.service";
import { toast } from "sonner";

export default function StaffRoleDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const isNew = id === "new";
  
  const { data: roles = [], isLoading: isLoadingRoles } = useStaffRoles();
  const createMutation = useCreateStaffRole();
  const updateMutation = useUpdateStaffRole();

  const editingRole = roles.find(r => r.id === id);

  const handleSave = (data: CreateStaffRolePayload) => {
    if (!isNew && id) {
      updateMutation.mutate({ id, payload: data }, {
        onSuccess: () => {
          toast.success("Role updated successfully");
          router.push("/staff/roles");
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Role created successfully");
          router.push("/staff/roles");
        },
      });
    }
  };

  if (!isNew && isLoadingRoles) {
    return (
      <LayoutController showMainMenu showHorizontalToolbar>
        <StaffMenu />
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LayoutController>
    );
  }

  if (!isNew && !editingRole && !isLoadingRoles) {
    return (
      <LayoutController showMainMenu showHorizontalToolbar>
        <StaffMenu />
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold">Role not found</h2>
          <Button variant="link" onClick={() => router.push("/staff/roles")}>
            Back to roles list
          </Button>
        </div>
      </LayoutController>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title={isNew ? "Add New Role" : `Edit Role: ${editingRole?.nameEn}`}
        subtitle="Configure role details and permissions."
        icon={Users}
        actions={
          <Button variant="ghost" size="sm" onClick={() => router.push("/staff/roles")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
        }
      />

      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="max-w-2xl mx-auto">
              <StaffRoleForm
                defaultValues={editingRole ? {
                  nameSi: editingRole.nameSi,
                  nameEn: editingRole.nameEn,
                  descriptionSi: editingRole.descriptionSi,
                  descriptionEn: editingRole.descriptionEn,
                  gradeBased: editingRole.gradeBased,
                  singleGraded: editingRole.singleGraded,
                  gradesEffected: editingRole.gradesEffected,
                  responsibilities: editingRole.responsibilities,
                  teacherIds: editingRole.teacherIds,
                  order: editingRole.order,
                } : undefined}
                onSubmit={handleSave}
                onCancel={() => router.push("/staff/roles")}
                isLoading={createMutation.isPending || updateMutation.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutController>
  );
}
