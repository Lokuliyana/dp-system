"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, Search, Plus, Filter, Download } from "lucide-react";

import { useStudentsByGrade, useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { AdvancedTable, StatCard } from "@/components/reusable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  LayoutController,
  DynamicPageHeader,
  HorizontalToolbar,
  HorizontalToolbarIcons,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import { StudentForm } from "@/components/students/student-form";

import type { Student } from "@/types/models";
import {
  getStudentColumns,
  studentRowDecorations,
} from "@/components/students/student-table-config";

interface GradePageProps {
  params: {
    gradeId: string;
  };
}

export default function GradeStudentListPage({ params }: GradePageProps) {
  const router = useRouter();
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedGradeId = params.gradeId;
  const grade = grades.find((g) => g.id === selectedGradeId);

  // Fetch students using the real hook
  const { data: students = [], isLoading } = useStudentsByGrade(selectedGradeId);
  const createStudentMutation = useCreateStudent();
  const updateStudentMutation = useUpdateStudent();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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

  const handleViewStudent = (student: Student) => {
    router.push(`/students/${selectedGradeId}/${student.id}`);
  };

  const handleSaveStudent = (data: any) => {
    if (editingStudent) {
      updateStudentMutation.mutate({ id: editingStudent.id, payload: data }, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setEditingStudent(null);
        },
      });
    } else {
      createStudentMutation.mutate(data, {
        onSuccess: () => {
          setIsCreateModalOpen(false);
        },
      });
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsCreateModalOpen(true);
  };

  // Reset editing state when modal closes
  const onOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) setEditingStudent(null);
  };

  const filteredStudents = students.filter(s => 
    !searchTerm || 
    s.firstNameEn.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.lastNameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title={grade.nameSi || grade.nameEn}
        subtitle={`Class Teacher: ${grade.classTeacherId ? "Assigned" : "Not Assigned"}`}
        icon={Users}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.push("/students")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Grades
          </Button>
        }
      />

      <HorizontalToolbar className="px-6 py-3 border-b bg-muted/10">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <HorizontalToolbarIcons>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Sheet open={isCreateModalOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                className="h-9 gap-2"
                onClick={() => setEditingStudent(null)}
              >
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[600px] sm:w-[540px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </SheetTitle>
                <SheetDescription>
                  {editingStudent ? "Update the student's details." : "Enter the details of the new student."}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <StudentForm 
                  grades={grades.map(g => ({ id: g.id, name: g.nameSi || g.nameEn }))}
                  sections={sections.map(s => ({ id: s.id, name: s.nameSi || s.nameEn }))}
                  onSubmit={handleSaveStudent}
                  isLoading={createStudentMutation.isPending || updateStudentMutation.isPending}
                  initialData={editingStudent ? {
                    ...editingStudent,
                    gradeId: editingStudent.gradeId || selectedGradeId
                  } : { gradeId: selectedGradeId }}
                />
              </div>
            </SheetContent>
          </Sheet>
        </HorizontalToolbarIcons>
      </HorizontalToolbar>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total Students" value={students.length} />
          {/* Add more stats if available in the API response or derived */}
        </div>

        <AdvancedTable<Student>
          columns={getStudentColumns(handleViewStudent, handleEditStudent)}
          rowDecorations={studentRowDecorations}
          title={`${grade.nameSi || grade.nameEn} - Student Management`}
          subtitle={`Total Students: ${students.length}`}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          idField="id"
          // onAddRow handled via toolbar button
          editable
          enableSelection
          enableBulkActions
          data={filteredStudents}
          enableSearch={false}
          enableFiltering
          enableSorting
          enableColumnVisibility
          enableExport={false}
          enableValidation
          enableRowNumbers
          enableStatusBar
          pageSize={20}
          stickyHeader
        />
      </div>
    </LayoutController>
  );
}
