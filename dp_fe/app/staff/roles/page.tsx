"use client";

import { useState, useMemo } from "react";
import { Users, Plus, Edit, Trash2, ListTree, LayoutList } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui";
import { useStaffRoles, useCreateStaffRole, useUpdateStaffRole, useDeleteStaffRole } from "@/hooks/useStaffRoles";
import { useTeachers } from "@/hooks/useTeachers";
import { StaffRoleForm } from "@/components/staff/StaffRoleForm";
import { CreateStaffRolePayload } from "@/services/masterdata/staffRoles.service";
import { DeleteConfirmationModal } from "@/components/reusable";
import { LevelHierarchyView, Level, LevelItem } from "@/components/soluna-components/level-hierarchy-view";
import type { StaffRole, Teacher } from "@/types/models";

export default function StaffRolesPage() {
  const { data: roles = [], isLoading: isLoadingRoles } = useStaffRoles();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();
  
  const createMutation = useCreateStaffRole();
  const updateMutation = useUpdateStaffRole();
  const deleteMutation = useDeleteStaffRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRole | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<LevelItem | null>(null);

  const handleSave = (data: CreateStaffRolePayload) => {
    if (editingRole) {
      updateMutation.mutate({ id: editingRole.id, payload: data }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingRole(null);
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleEdit = (role: StaffRole) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setItemToDelete(null),
    });
  };

  // Hierarchy Data Transformation
  const hierarchyLevels: Level[] = useMemo(() => {
    if (!roles.length || !teachers.length) return [];

    // Sort roles by order
    const sortedRoles = [...roles].sort((a, b) => (a.order || 999) - (b.order || 999));

    return sortedRoles.map((role, index) => {
      // Find teachers who have this role
      const roleTeachers = teachers.filter(t => t.roleIds?.includes(role.id));

      return {
        id: role.id,
        label: role.nameEn,
        color: `bg-${['blue', 'purple', 'green', 'orange', 'red', 'indigo'][index % 6]}-500`,
        items: roleTeachers.map(t => ({
          id: t.id,
          label: t.fullNameEn,
          data: {
            role: role.nameEn,
            email: t.email,
            phone: t.phone,
            teacher: t // Store full teacher object for details
          }
        }))
      };
    }).filter(level => level.items.length > 0); // Only show levels with teachers
  }, [roles, teachers]);

  const renderHierarchyItem = (item: LevelItem) => {
    return (
      <div className="group relative flex items-center gap-3 p-3 rounded-md border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200">
        <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors font-medium text-xs">
          {item.label.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm truncate text-foreground/90">{item.label}</span>
          <span className="text-[11px] text-muted-foreground truncate uppercase tracking-wide">{item.data?.role}</span>
        </div>
      </div>
    );
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title="Staff Roles"
        subtitle="Manage teacher roles and hierarchy."
        icon={Users}
        actions={
          <Button className="gap-2" onClick={() => {
            setEditingRole(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="gap-2">
                <ListTree className="h-4 w-4" />
                Hierarchy View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Defined Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {isLoadingRoles ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading roles...</div>
                  ) : roles.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No roles found.</div>
                  ) : (
                    roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="space-y-1">
                          <p className="font-medium text-slate-900">{role.nameEn}</p>
                          <p className="text-sm text-slate-500">{role.nameSi}</p>
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            {role.gradeBased && (
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700 border border-blue-100">
                                Grade-based {role.singleGraded ? "(single)" : ""}
                              </span>
                            )}
                            {(role.gradesEffected || []).length > 0 && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-700">
                                Grades: {(role.gradesEffected || []).length}
                              </span>
                            )}
                            {role.responsibilities?.length ? (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
                                {role.responsibilities.length} responsibilities
                              </span>
                            ) : null}
                          </div>
                          {role.descriptionEn && <p className="text-xs text-slate-400 mt-1">{role.descriptionEn}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => handleEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => setItemToDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hierarchy">
            <Card>
              <CardContent className="p-6">
                {isLoadingRoles || isLoadingTeachers ? (
                  <div className="p-8 text-center text-sm text-slate-500">Loading hierarchy...</div>
                ) : hierarchyLevels.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No hierarchy data available. Assign roles to staff members to see them here.
                  </div>
                ) : (
                  <LevelHierarchyView
                    levels={hierarchyLevels}
                    renderItem={renderHierarchyItem}
                    onItemClick={setSelectedTeacher}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingRole(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRole ? "Edit Role" : "Add New Role"}</DialogTitle>
          </DialogHeader>
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
            onCancel={() => setIsModalOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this role"
        isLoading={deleteMutation.isPending}
      />

      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {selectedTeacher?.label.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-xl">{selectedTeacher?.label}</SheetTitle>
                <SheetDescription className="text-base font-medium text-primary">
                  {selectedTeacher?.data?.role}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-2">
                {selectedTeacher?.data?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{selectedTeacher.data.email}</span>
                  </div>
                )}
                {selectedTeacher?.data?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedTeacher.data.phone}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium capitalize">{selectedTeacher?.data?.teacher?.status || 'Active'}</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutController>
  );
}
