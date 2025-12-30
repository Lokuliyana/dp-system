"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Filter, Download, Plus } from "lucide-react";

import { useStudents, useUpdateStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutController,
  DynamicPageHeader,
  HorizontalToolbar,
  HorizontalToolbarIcons,
  VerticalToolbar,
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
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();

  const { data, isLoading } = useStudents({
    page,
    limit,
    search,
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
    <LayoutController showMainMenu showHorizontalToolbar showVerticalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title="සියලුම සිසු​න් - Students"
        subtitle="Manage students in all Grades."
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-sm gap-2 px-3"
              onClick={() => {}} // Add export logic if needed
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <BulkImportModal />
            <Button 
              size="sm" 
              className="h-9 text-sm gap-2 px-4 bg-purple-600 hover:bg-purple-700"
              onClick={() => router.push("/students/add")}
            >
              <Plus className="h-4 w-4" />
              Add Student
            </Button>
          </div>
        }
      />

      <VerticalToolbar>
        <Button
          variant="ghost"
          size="icon"
          title="All Students"
          className="text-purple-600 bg-purple-50"
        >
          <Users className="h-4 w-4" />
        </Button>
      </VerticalToolbar>

      <HorizontalToolbar className="px-4 py-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-md w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, admission no, or whatsapp..."
              className="pl-8 h-9 text-sm w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <HorizontalToolbarIcons>
          <Button variant="outline" size="sm" className="h-9 text-sm gap-2 px-3">
            <Filter className="h-4 w-4" />
            Filter
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
        </HorizontalToolbarIcons>
      </HorizontalToolbar>

      <div className="p-4 sm:p-6 pt-0 space-y-6">
        <StudentListView
          students={students.map(s => ({
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
            status: "active",
            academicPerformance: "average",
            talents: [],
            notes: [],
            phoneNumber: s.phoneNum || s.emergencyNumber || s.whatsappNumber || s.fatherNumber || s.motherNumber || "",
            fullNameEn: s.fullNameEn || "",
            whatsappNumber: s.whatsappNumber || "",
          }))}
          showGradeColumn={true}
          onSelectStudent={(s: any) => handleViewStudent(s)}
          onEditStudent={(s: any) => handleEditStudent(s)}
          totalItems={total}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={limit}
          grades={grades.map(g => ({ id: g.id, name: g.nameSi || g.nameEn }))}
          hideHeader={true}
        />
      </div>
    </LayoutController>
  );
}
