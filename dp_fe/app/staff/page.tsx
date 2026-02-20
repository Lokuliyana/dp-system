"use client";

import { useState } from "react";
import { Users, Plus, Search, Edit, Trash2, Eye, Shield } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogHeader, DialogTitle, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, Badge } from "@/components/ui";
import { useTeachers, useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from "@/hooks/useTeachers";
import { useClubs } from "@/hooks/useClubs";
import { useGrades, useUpdateGrade } from "@/hooks/useGrades";
import { TeacherForm } from "@/components/staff/TeacherForm";
import { CreateTeacherPayload } from "@/services/masterdata/teachers.service";
import { DeleteConfirmationModal, ExportButton } from "@/components/reusable";
import type { Teacher } from "@/types/models";

export default function StaffPage() {
  const { data: teachers = [], isLoading } = useTeachers();
  const { data: clubs = [] } = useClubs();
  const { data: grades = [] } = useGrades();
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deleteTeacherMutation = useDeleteTeacher();
  const updateGradeMutation = useUpdateGrade();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const handleCreate = (data: any) => {
    const { assignedGradeId, ...teacherData } = data;

    const onSuccess = (teacher: Teacher) => {
      if (assignedGradeId) {
        // If assignedGradeId is "unassigned" or null, we might want to clear it?
        // But the form sends null if unassigned.
        // Also need to check if we need to clear previous grade assignment?
        // For now, just set the new one.
        updateGradeMutation.mutate({ 
          id: assignedGradeId, 
          payload: { classTeacherId: teacher.id } 
        });
      }
      setIsCreateModalOpen(false);
      setEditingTeacher(null);
    };

    if (editingTeacher) {
      updateTeacherMutation.mutate(
        { id: editingTeacher.id, payload: teacherData },
        {
          onSuccess: () => onSuccess(editingTeacher),
        },
      );
    } else {
      createTeacherMutation.mutate(teacherData, {
        onSuccess: (newTeacher) => {
          // The mutation returns the new teacher, but useCreateTeacher hook might not return it in onSuccess callback arg?
          // Let's check useTeachers.ts. It calls onSuccess with no args in the hook definition I saw earlier?
          // Wait, useCreateTeacher in hooks/useTeachers.ts:
          // onSuccess: () => { queryClient.invalidateQueries... }
          // It does NOT pass the data.
          // I need to fix useCreateTeacher to pass data or refetch.
          // Actually, createTeacherMutation.mutate(payload, { onSuccess: (data, variables, context) => ... })
          // The data arg in onSuccess IS the response data.
          onSuccess(newTeacher as unknown as Teacher); 
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteTeacherMutation.mutate(id, {
      onSuccess: () => setItemToDelete(null),
    });
  };

  const filteredTeachers = teachers.filter((t) =>
    t.firstNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastNameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StaffMenu />

      <DynamicPageHeader
        title="Staff Management"
        subtitle="Manage teachers and staff members."
        icon={Users}
        actions={[
          {
            type: "search",
            props: {
              value: searchQuery,
              onChange: setSearchQuery,
              placeholder: "Search staff...",
            },
          },
          {
            type: "custom",
            render: (
              <ExportButton 
                endpoint="/reports/teams" 
                filename="staff_management_report"
                className="h-9"
              />
            )
          },
          {
            type: "button",
            props: {
              variant: "default",
              icon: Plus,
              children: "Add Staff",
              onClick: () => setIsCreateModalOpen(true),
            },
          },
        ]}
      />

      <div className="p-6 space-y-6">


        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              All Staff Members
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading staff...</div>
              ) : filteredTeachers.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No staff members found.</div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                  <div>
                    <p className="font-medium text-slate-900">
                      {teacher.firstNameEn} {teacher.lastNameEn}
                    </p>
                    <p className="text-sm text-slate-500">
                      {teacher.email} {teacher.phone ? `• ${teacher.phone}` : ""}
                    </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => {
                          setEditingTeacher(teacher);
                          setIsCreateModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => setSelectedTeacher(teacher)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => setItemToDelete(teacher.id)}
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
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTeacher ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
          </DialogHeader>
          <TeacherForm
            defaultValues={{
              ...(editingTeacher || {}),
              assignedGradeId: editingTeacher 
                ? grades.find(g => g.classTeacherId === editingTeacher.id)?.id 
                : undefined
            }}
            onSubmit={handleCreate}
            onCancel={() => {
              setIsCreateModalOpen(false);
              setEditingTeacher(null);
            }}
            isLoading={createTeacherMutation.isPending || updateTeacherMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this staff member"
        isLoading={deleteTeacherMutation.isPending}
      />

      <Sheet open={!!selectedTeacher} onOpenChange={(open) => !open && setSelectedTeacher(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {selectedTeacher?.firstNameEn[0]}{selectedTeacher?.lastNameEn[0]}
              </div>
              <div>
                <SheetTitle className="text-xl">
                  {selectedTeacher?.firstNameEn} {selectedTeacher?.lastNameEn}
                </SheetTitle>
                <SheetDescription className="text-base font-medium text-primary">
                  {selectedTeacher?.email}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield className="h-4 w-4" /> Roles & Responsibilities
              </h4>
              
              {/* MIC Roles */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-900">Master in Charge (MIC)</p>
                {clubs.filter(c => c.teacherInChargeId === selectedTeacher?.id).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {clubs.filter(c => c.teacherInChargeId === selectedTeacher?.id).map(club => (
                      <Badge key={club.id} variant="secondary" className="px-3 py-1">
                        {club.nameEn}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No clubs assigned.</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Info</h4>
              <div className="space-y-2">
                {selectedTeacher?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedTeacher.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="capitalize">{selectedTeacher?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutController>
  );
}
