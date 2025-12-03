"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import { useGrades, useUpdateGrade } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents"; // We might need to fetch students count per grade if not in grade object
import { GradeSelector } from "@/components/students/grade/GradeSelector";
import { GradeForm } from "@/components/students/grade/GradeForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Grade } from "@/types/models";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";

export default function StudentsPage() {
  const router = useRouter();
  const { data: grades = [], isLoading } = useGrades();

  // Ideally, the grades API should return student counts. 
  // If not, we might need to fetch it separately or the backend should provide it.
  // Assuming grades have a studentCount property or similar based on listGradesWithStats
  
  const studentCountsByGrade = grades.reduce((acc, g) => {
    // @ts-ignore - assuming studentCount exists in the response from listGradesWithStats
    acc[g.id] = g.studentCount || 0;
    return acc;
  }, {} as Record<string, number>);

  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const updateGradeMutation = useUpdateGrade();

  const handleEditGrade = (grade: Grade) => {
    setEditingGrade(grade);
    setIsEditModalOpen(true);
  };

  const handleUpdateGrade = (data: any) => {
    if (editingGrade) {
      updateGradeMutation.mutate({ id: editingGrade.id, payload: data }, {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setEditingGrade(null);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        <span>Loading students...</span>
      </div>
    );
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      {/* 1. Sidebar: Global Navigation */}
      <StudentsMenu />

      {/* 2. Header: Page Title & Actions */}
      <DynamicPageHeader
        title="Student Management"
        subtitle="Browse grades and manage student profiles across the school."
        icon={Users}
      />

      {/* 3. Content: Grade Selector */}
      <div className="p-6">
        <GradeSelector
          grades={grades}
          studentCountsByGrade={studentCountsByGrade}
          onSelectGrade={(gradeId) => router.push(`/students/${gradeId}`)}
          onEdit={handleEditGrade}
        />
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Grade</DialogTitle>
          </DialogHeader>
          <GradeForm
            defaultValues={editingGrade ? {
              nameSi: editingGrade.nameSi,
              nameEn: editingGrade.nameEn,
              level: editingGrade.level,
            } : undefined}
            onSubmit={handleUpdateGrade}
            isLoading={updateGradeMutation.isPending}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </LayoutController>
  );
}
