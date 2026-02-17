"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Download, Plus } from "lucide-react";

import { useStudents, useUpdateStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/ui/button";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import { StudentListView } from "@/components/students/student-list-view";
import { BulkImportModal } from "@/components/students/bulk-import-modal";
import type { Student } from "@/types/models";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { StudentForm } from "@/components/students/student-form";

export default function UniversalStudentListPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sex, setSex] = useState("all");
  const [grade, setGrade] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();

  const { data, isLoading } = useStudents({
    page,
    limit,
    search,
    status: status === "all" ? undefined : status,
    sex: sex === "all" ? undefined : sex,
    gradeId: grade === "all" ? undefined : grade,
  });

  const students = data?.items || [];
  const total = data?.total || 0;

  const updateStudentMutation = useUpdateStudent();

  const handleViewStudent = (student: Student) => {
    router.push(`/students/${student.gradeId}/${student.id}`);
  };

  const handleEditStudent = (student: any) => {
    // student here is the MockStudent from the list view
    // We need to find the real student object from the API data
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
        title="Universal Student View"
        subtitle="Search and manage all students across the school."
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 text-sm gap-2 px-3">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <BulkImportModal />
            <Button 
              size="sm" 
              className="h-9 text-sm gap-2 px-4"
              onClick={() => router.push("/students/add")}
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
            <Sheet open={isCreateModalOpen} onOpenChange={onOpenChange}>
              <SheetContent className="w-full sm:w-[540px] overflow-y-auto">
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

      <div className="p-4 sm:p-6 space-y-6">
        <StudentListView
          students={students.map(s => ({
            id: s.id,
            gradeId: s.gradeId && typeof s.gradeId === 'object' ? (s.gradeId as any)._id || (s.gradeId as any).id : s.gradeId,
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
            status: (s.status as any) || "active",
            academicPerformance: "average",
            academicYear: s.academicYear || 2024,
            talents: [],
            notes: [],
            phoneNumber: s.phoneNum || s.emergencyNumber || s.whatsappNumber || s.fatherNumber || s.motherNumber || "",
            whatsappNumber: s.whatsappNumber || "",
            sex: s.sex || "",
          }))}
          showGradeColumn={true}
          onSelectStudent={(s: any) => handleViewStudent(s)}
          onEditStudent={(s: any) => handleEditStudent(s)}
          totalItems={total}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          grades={grades.map(g => ({ id: g.id, name: g.nameSi || g.nameEn }))}
          showFilters={true}
          searchTerm={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          statusFilter={status}
          onStatusChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
          sexFilter={sex}
          onSexChange={(val) => {
            setSex(val);
            setPage(1);
          }}
          gradeFilter={grade}
          onGradeChange={(val) => {
            setGrade(val);
            setPage(1);
          }}
        />
      </div>
    </LayoutController>
  );
}
