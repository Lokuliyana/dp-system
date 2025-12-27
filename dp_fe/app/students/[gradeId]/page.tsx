"use client";

import { useRouter } from "next/navigation";
import { Users, ChevronLeft } from "lucide-react";

import { useState } from "react";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade, useUpdateStudent } from "@/hooks/useStudents";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/ui/button";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import { StudentListView } from "@/components/students/student-list-view";
import { Student as MockStudent } from "@/lib/school-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StudentForm } from "@/components/students/student-form";
import type { Student } from "@/types/models";

interface GradePageProps {
  params: {
    gradeId: string;
  };
}

export default function GradePage({ params }: GradePageProps) {
  const router = useRouter();
  const { gradeId } = params;
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();
  const { data: students = [], isLoading } = useStudentsByGrade(gradeId);
  const updateStudentMutation = useUpdateStudent();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const grade = grades.find((g) => g.id === gradeId);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        Loading students...
      </div>
    );
  }

  if (!grade) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-lg font-semibold text-foreground">Grade not found</p>
        <Button onClick={() => router.push("/students")}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to grades
        </Button>
      </div>
    );
  }

  // Map real students to mock student interface
  const mappedStudents: MockStudent[] = students.map(s => ({
    id: s.id,
    gradeId: typeof s.gradeId === 'object' ? (s.gradeId as any)._id || (s.gradeId as any).id : s.gradeId,
    admissionNumber: s.admissionNumber || "",
    firstName: s.firstNameSi || s.firstNameEn || "",
    lastName: s.lastNameSi || s.lastNameEn || "",
    nameWithInitialsSi: s.nameWithInitialsSi || "",
    email: s.email || "",
    dateOfBirth: s.dob || "",
    enrollmentDate: s.admissionDate || "",
    parentName: s.fatherNameEn || s.motherNameEn || "",
    parentPhone: s.fatherNumber || s.motherNumber || s.emergencyNumber || "",
    address: s.addressEn || s.addressSi || "",
    status: "active", // Default
    academicPerformance: "average", // Default
    talents: [],
    notes: [],
    phoneNumber: s.phoneNum || s.emergencyNumber || s.whatsappNumber || s.fatherNumber || s.motherNumber || "",
    fullNameEn: s.fullNameEn || "",
    whatsappNumber: s.whatsappNumber || "",
  }));

  const handleEditStudent = (student: MockStudent) => {
    // Find the real student object
    const realStudent = students.find(s => s.id === student.id);
    if (realStudent) {
      setEditingStudent(realStudent);
      setIsCreateModalOpen(true);
    }
  };

  const handleSaveStudent = (payload: any) => {
    if (editingStudent) {
      updateStudentMutation.mutate(
        { id: editingStudent.id, payload },
        {
          onSuccess: () => {
            setIsCreateModalOpen(false);
            setEditingStudent(null);
          },
        }
      );
    }
  };

  const onOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) setEditingStudent(null);
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title={`${grade.nameSi || grade.nameEn} - Students`}
        subtitle="Manage students in this grade."
        icon={Users}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push("/students")}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Grades
            </Button>
            <Sheet open={isCreateModalOpen} onOpenChange={onOpenChange}>
              <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Edit Student</SheetTitle>
                  <SheetDescription>Update the student&apos;s details.</SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <StudentForm
                    grades={grades.map((g) => ({
                      id: g.id,
                      name: g.nameSi || g.nameEn,
                    }))}
                    sections={sections.map((s) => ({
                      id: s.id,
                      name: s.nameSi || s.nameEn,
                    }))}
                    onSubmit={handleSaveStudent}
                    isLoading={updateStudentMutation.isPending}
                    initialData={editingStudent || {}}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        }
      />

      <div className="p-6">
        <StudentListView 
          students={mappedStudents} 
          gradeId={gradeId}
          onSelectStudent={(student) => router.push(`/students/${gradeId}/${student.id}`)}
          onEditStudent={handleEditStudent}
          showGradeColumn={false}
          grades={grades.map(g => ({ id: g.id, name: g.nameSi || g.nameEn }))}
        />
      </div>
    </LayoutController>
  );
}
