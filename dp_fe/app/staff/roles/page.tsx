"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, Plus, Edit, Trash2, ListTree, LayoutList, ChevronRight, ShieldCheck } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { useStaffRoles, useDeleteStaffRole } from "@/hooks/useStaffRoles";
import { useTeachers } from "@/hooks/useTeachers";
import { DeleteConfirmationModal } from "@/components/reusable";
import { LevelHierarchyView, Level, LevelItem } from "@/components/soluna-components/level-hierarchy-view";
import { ResponsiveTabs } from "@/components/ui";

export default function StaffRolesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");
  const { data: roles = [], isLoading: isLoadingRoles } = useStaffRoles();
  const { data: teachers = [], isLoading: isLoadingTeachers } = useTeachers();

  const deleteMutation = useDeleteStaffRole();
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<LevelItem | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, { onSuccess: () => setItemToDelete(null) });
  };

  const hierarchyLevels: Level[] = useMemo(() => {
    if (!roles.length || !teachers.length) return [];
    const sortedRoles = [...roles].sort((a, b) => (a.order || 999) - (b.order || 999));
    return sortedRoles.map((role, index) => {
      const roleTeachers = teachers.filter(t => t.roleIds?.includes(role.id));
      return {
        id: role.id,
        label: role.nameEn,
        color: `bg-${['blue', 'purple', 'green', 'orange', 'red', 'indigo'][index % 6]}-500`,
        items: roleTeachers.map(t => ({
          id: t.id,
          label: t.fullNameEn || "Unknown",
          data: { role: role.nameEn, email: t.email, phone: t.phone, teacher: t },
        })),
      };
    }).filter(level => level.items.length > 0);
  }, [roles, teachers]);

  const renderHierarchyItem = (item: LevelItem) => (
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

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title="Staff Roles"
        subtitle="Manage teacher roles and organisational hierarchy."
        icon={Users}
        actions={
          <PermissionGuard permission="staff.staff_role.create">
            <Button className="gap-2" onClick={() => router.push("/staff/roles/new")}>
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </PermissionGuard>
        }
      />

      <div className="p-6 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab bar */}
          <div className="flex items-center justify-between">
            <ResponsiveTabs
              items={[
                { value: "list", label: "List View", icon: LayoutList },
                { value: "hierarchy", label: "Hierarchy View", icon: ListTree },
              ]}
              value={activeTab}
              onValueChange={setActiveTab}
            />
            {activeTab === "list" && (
              <span className="text-xs text-muted-foreground hidden sm:block">
                {roles.length} role{roles.length !== 1 ? "s" : ""} defined
              </span>
            )}
          </div>

          {/* ── List view ─────────────────────────────────── */}
          <TabsContent value="list" className="mt-4">
            <Card>
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Defined Roles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 mt-2">
                {isLoadingRoles ? (
                  <div className="p-10 text-center text-sm text-muted-foreground">Loading roles…</div>
                ) : roles.length === 0 ? (
                  <div className="p-10 text-center space-y-2">
                    <ShieldCheck className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">No roles defined yet.</p>
                    <Button size="sm" onClick={() => router.push("/staff/roles/new")}>
                      <Plus className="h-4 w-4 mr-1" /> Add first role
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {roles.map((role) => {
                      const assignedCount = teachers.filter(t => t.roleIds?.includes(role.id)).length;
                      return (
                        <div
                          key={role.id}
                          className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/staff/roles/${role.id}`)}
                        >
                          {/* Left — role info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center border border-primary/10">
                              <ShieldCheck className="h-4 w-4 text-primary/60" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <p className="font-medium text-sm text-slate-900 group-hover:text-primary transition-colors truncate">
                                {role.nameEn}
                              </p>
                              <p className="text-xs text-slate-400 truncate">{role.nameSi}</p>
                              {/* badges */}
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {role.gradeBased && (
                                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 border border-blue-100">
                                    Grade-based{role.singleGraded ? " · single" : ""}
                                  </span>
                                )}
                                {(role.gradesEffected || []).length > 0 && (
                                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                                    {(role.gradesEffected || []).length} grade{(role.gradesEffected || []).length !== 1 ? "s" : ""}
                                  </span>
                                )}
                                {(role.responsibilities?.length ?? 0) > 0 && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 border border-emerald-100">
                                    {role.responsibilities!.length} responsibilities
                                  </span>
                                )}
                                {assignedCount > 0 && (
                                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700 border border-violet-100">
                                    {assignedCount} teacher{assignedCount !== 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right — actions */}
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <PermissionGuard permission="staff.staff_role.update">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                onClick={() => router.push(`/staff/roles/${role.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <PermissionGuard permission="staff.staff_role.delete">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => setItemToDelete(role.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </PermissionGuard>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors ml-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Hierarchy view ────────────────────────────── */}
          <TabsContent value="hierarchy" className="mt-4">
            <Card>
              <CardHeader className="pb-0 pt-4 px-4">
                <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Role Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {isLoadingRoles || isLoadingTeachers ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">Loading hierarchy…</div>
                ) : hierarchyLevels.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <ListTree className="mx-auto h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                      No hierarchy data yet. Assign roles to staff members to see them here.
                    </p>
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

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this role"
        isLoading={deleteMutation.isPending}
      />

      {/* Teacher detail sheet */}
      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {selectedTeacher?.label.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-lg leading-tight">{selectedTeacher?.label}</SheetTitle>
                <SheetDescription className="text-sm font-medium text-primary mt-0.5">
                  {selectedTeacher?.data?.role}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="py-5 space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</p>
              {selectedTeacher?.data?.email ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-12 shrink-0">Email</span>
                  <span className="font-medium truncate">{selectedTeacher.data.email}</span>
                </div>
              ) : null}
              {selectedTeacher?.data?.phone ? (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground w-12 shrink-0">Phone</span>
                  <span className="font-medium">{selectedTeacher.data.phone}</span>
                </div>
              ) : null}
              {!selectedTeacher?.data?.email && !selectedTeacher?.data?.phone && (
                <p className="text-sm text-muted-foreground italic">No contact info on file.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium capitalize">
                  {selectedTeacher?.data?.teacher?.status || "Active"}
                </span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutController>
  );
}
