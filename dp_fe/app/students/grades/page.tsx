"use client";

import { useState } from "react";
import { Settings, Plus, Edit, Trash2, Users, Search } from "lucide-react";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui";
import { DeleteConfirmationModal } from "@/components/reusable";
import { useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { GradeForm } from "@/components/students/grade/GradeForm";
import { CreateGradePayload } from "@/services/masterdata/grades.service";
import { Grade } from "@/types/models";

export default function GradesManagementPage() {
  const { data: grades = [], isLoading } = useGrades();
  const { data: teachers = [] } = useTeachers();
  const createGradeMutation = useCreateGrade();
  const updateGradeMutation = useUpdateGrade();
  const deleteGradeMutation = useDeleteGrade();
  
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  const handleDelete = (id: string) => {
    deleteGradeMutation.mutate(id, {
      onSuccess: () => setItemToDelete(null),
    });
  };

  const handleCreate = (data: CreateGradePayload) => {
    createGradeMutation.mutate(data, {
      onSuccess: () => setIsCreateModalOpen(false),
    });
  };

  const handleUpdate = (data: CreateGradePayload) => {
    if (editingGrade) {
      updateGradeMutation.mutate({ id: editingGrade.id, payload: data }, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setEditingGrade(null);
        },
      });
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setIsCreateModalOpen(true);
  };

  const filteredGrades = grades.filter((grade) => 
    grade.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
    grade.nameSi.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading grades...</span>
      </div>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title="Grade Management"
        subtitle="Define and manage school grades."
        icon={Settings}
        actions={
          <Button className="gap-2" onClick={() => {
            setEditingGrade(null);
            setIsCreateModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Add Grade
          </Button>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search grades by name (En/Si)..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              All Grades
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredGrades.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No grades found.
                </div>
              ) : (
                filteredGrades.map((grade) => (
                  <div
                    key={grade.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-4 sm:gap-0"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{grade.nameSi}</p>
                      <p className="text-sm text-slate-500">{grade.nameEn}</p>
                      {grade.classTeacherId && (
                        <p className="text-xs text-blue-600 mt-1">
                          Head: {teachers.find(t => t.id === grade.classTeacherId)?.firstNameEn} {teachers.find(t => t.id === grade.classTeacherId)?.lastNameEn}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-4 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => handleEdit(grade)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => setItemToDelete(grade.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGrade ? "Edit Grade" : "Add New Grade"}</DialogTitle>
            <DialogDescription>
              {editingGrade ? "Update grade details." : "Create a new grade level for the school."}
            </DialogDescription>
          </DialogHeader>
          <GradeForm 
            defaultValues={editingGrade ? {
              nameSi: editingGrade.nameSi,
              nameEn: editingGrade.nameEn,
              level: editingGrade.level,
              classTeacherId: editingGrade.classTeacherId,
            } : undefined}
            onSubmit={editingGrade ? handleUpdate : handleCreate} 
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createGradeMutation.isPending || updateGradeMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this grade"
      />
    </LayoutController>
  );
}
