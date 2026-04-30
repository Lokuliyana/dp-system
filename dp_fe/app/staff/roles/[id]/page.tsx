"use client";

import { useRouter } from "next/navigation";
import { Users, ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
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
        <div className="p-8 text-center space-y-3">
          <h2 className="text-lg font-semibold">Role not found</h2>
          <Button variant="outline" onClick={() => router.push("/staff/roles")} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Roles
          </Button>
        </div>
      </LayoutController>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title={isNew ? "Add New Role" : `Edit Role`}
        subtitle={isNew ? "Define a new staff role and its configuration." : `Editing: ${editingRole?.nameEn}`}
        icon={Users}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/staff/roles")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Roles
          </Button>
        }
      />

      <div className="p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
          <button
            onClick={() => router.push("/staff/roles")}
            className="hover:text-foreground transition-colors"
          >
            Staff Roles
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium">
            {isNew ? "New Role" : (editingRole?.nameEn ?? "Edit Role")}
          </span>
        </nav>

        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base">
              {isNew ? "Role Configuration" : "Edit Role Configuration"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Fill in the details below to {isNew ? "create" : "update"} the role.
            </p>
          </CardHeader>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>
    </LayoutController>
  );
}
