"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, Search, Plus, Filter, Download, Layers, UserPlus, Calendar, FileText, Star } from "lucide-react";

import { useStudents, useCreateStudent, useUpdateStudent } from "@/hooks/useStudents";
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

interface SectionStudentsPageProps {
  params: {
    gradeId: string;
    sectionId: string;
  };
}

export default function SectionStudentsPage({ params }: SectionStudentsPageProps) {
  const router = useRouter();
  const { gradeId, sectionId } = params;
  
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const grade = grades.find((g) => g.id === gradeId);
  const section = sections.find((s) => s.id === sectionId);

  // Fetch students for this specific section
  const { data, isLoading } = useStudents({
    gradeId,
    sectionId,
    limit: 100, // Fetch all for now as we use client-side search/filter here for simplicity
  });

  const students = data?.items || [];
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

  if (!grade || !section) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-lg font-semibold text-foreground">Grade or Section not found</p>
        <Button onClick={() => router.push(`/students/${gradeId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to sections
        </Button>
      </div>
    );
  }

  const handleViewStudent = (student: Student) => {
    router.push(`/students/${gradeId}/${student.id}`);
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

  const onOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open);
    if (!open) setEditingStudent(null);
  };

  const filteredStudents = students.filter(s => 
    !searchTerm || 
    (s.fullNameEn && s.fullNameEn.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.admissionNumber && s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.whatsappNumber && s.whatsappNumber.includes(searchTerm))
  );

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title={`${grade.nameEn} - ${section.nameEn}`}
        subtitle={`Managing ${students.length} students in this section`}
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => router.push(`/students/bulk-add?gradeId=${gradeId}&sectionId=${sectionId}`)}
            >
              <UserPlus className="h-4 w-4" />
              Bulk Add
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/students/${gradeId}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Sections
            </Button>
          </div>
        }
      />

      <div className="px-6 py-4 border-b bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, admission no, or whatsapp..."
                className="pl-10 h-10 bg-white border-slate-200 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="h-10 gap-2 border-slate-200 bg-white">
              <Filter className="h-4 w-4 text-slate-500" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 bg-white">
              <Download className="h-4 w-4 text-slate-500" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="h-10 gap-2 border-slate-200 bg-white">
              <Plus className="h-4 w-4 text-slate-500" />
              Import
            </Button>
            <Sheet open={isCreateModalOpen} onOpenChange={onOpenChange}>
              <SheetTrigger asChild>
                <Button 
                  className="h-10 gap-2 shadow-sm"
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
                      gradeId: editingStudent.gradeId || gradeId,
                      sectionId: editingStudent.sectionId || sectionId
                    } : { gradeId, sectionId }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard 
            label="Total Students" 
            value={students.length} 
            icon={Users}
            trend="+12 this month"
            color="blue"
          />
          <StatCard 
            label="Attendance Today" 
            value="94%" 
            icon={Calendar}
            color="emerald"
          />
          <StatCard 
            label="Pending Fees" 
            value="LKR 45k" 
            icon={FileText}
            color="amber"
          />
          <StatCard 
            label="Performance" 
            value="B+" 
            icon={Star}
            color="purple"
          />
        </div>

        <AdvancedTable<Student>
          columns={getStudentColumns(handleViewStudent, handleEditStudent)}
          rowDecorations={studentRowDecorations}
          title="Student Directory"
          subtitle={`Showing ${filteredStudents.length} students`}
          icon={<Users className="h-5 w-5 text-primary" />}
          idField="id"
          editable
          enableSelection
          enableBulkActions
          data={filteredStudents}
          enableSearch={false}
          enableFiltering
          enableSorting
          enableColumnVisibility
          enableRowNumbers
          enableStatusBar
          pageSize={20}
          stickyHeader
        />
      </div>
    </LayoutController>
  );
}
