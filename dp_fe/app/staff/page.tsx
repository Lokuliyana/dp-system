"use client";

import { useState } from "react";
import { Users, Plus, Search, Edit, Trash2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { StaffMenu } from "@/components/staff/staff-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { useTeachers, useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from "@/hooks/useTeachers";
import { TeacherForm } from "@/components/staff/TeacherForm";
import { CreateTeacherPayload } from "@/services/masterdata/teachers.service";
import { DeleteConfirmationModal } from "@/components/reusable";
import type { Teacher } from "@/types/models";

export default function StaffPage() {
  const { data: teachers = [], isLoading } = useTeachers();
  const createTeacherMutation = useCreateTeacher();
  const updateTeacherMutation = useUpdateTeacher();
  const deleteTeacherMutation = useDeleteTeacher();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const handleCreate = (data: CreateTeacherPayload) => {
    if (editingTeacher) {
      updateTeacherMutation.mutate(
        { id: editingTeacher.id, payload: data },
        {
          onSuccess: () => {
            setEditingTeacher(null);
            setIsCreateModalOpen(false);
          },
        },
      );
    } else {
      createTeacherMutation.mutate(data, {
        onSuccess: () => setIsCreateModalOpen(false),
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
        actions={
          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search staff by name or NIC..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

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
            defaultValues={editingTeacher || undefined}
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
    </LayoutController>
  );
}
