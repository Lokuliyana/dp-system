"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DeleteConfirmationModal } from "@/components/reusable";
import { useTeachers, useCreateTeacher, useDeleteTeacher } from "@/hooks/useTeachers";
import type { CreateTeacherPayload } from "@/services/masterdata/teachers.service";
import { TeacherForm } from "./TeacherForm";

/**
 * Lightweight staff list + create component that relies on live API data.
 * Use the dedicated staff page for full management; this keeps legacy imports working without dummy data.
 */
export function TeacherRegistration() {
  const { data: teachers = [], isLoading } = useTeachers();
  const createTeacher = useCreateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((t) => {
        const search = searchTerm.toLowerCase();
        return (
          t.firstNameEn.toLowerCase().includes(search) ||
          t.lastNameEn.toLowerCase().includes(search) ||
          (t.email || "").toLowerCase().includes(search)
        );
      }),
    [teachers, searchTerm],
  );

  const handleCreate = (payload: CreateTeacherPayload) => {
    createTeacher.mutate(payload, { onSuccess: () => setIsFormOpen(false) });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="gap-2" onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Staff
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white divide-y">
        {isLoading ? (
          <div className="p-6 text-center text-slate-500">Loading staff...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-6 text-center text-slate-500">No staff found.</div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">
                  {teacher.firstNameEn} {teacher.lastNameEn}
                </p>
                <p className="text-sm text-slate-500">
                  {teacher.email} {teacher.phone ? `• ${teacher.phone}` : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:text-red-600"
                onClick={() => setItemToDelete(teacher.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <TeacherForm
            onSubmit={handleCreate}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createTeacher.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && deleteTeacher.mutate(itemToDelete, { onSuccess: () => setItemToDelete(null) })}
        itemName="this staff member"
        isLoading={deleteTeacher.isPending}
      />
    </div>
  );
}
