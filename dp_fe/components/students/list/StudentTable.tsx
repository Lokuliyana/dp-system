// components/list/StudentTable.tsx
"use client";

import type { Student } from "@/lib/school-data";
import { AdvancedTable } from "@/components/reusable";
import { Users } from "lucide-react";
import { getStudentColumns, studentRowDecorations } from "./student-table-config";

interface StudentTableProps {
  students: Student[];
  title: string;
  subtitle?: string;
  onViewStudent: (student: Student) => void;
  onAddStudent?: () => Student;
}

export function StudentTable({
  students,
  title,
  subtitle,
  onViewStudent,
  onAddStudent,
}: StudentTableProps) {
  return (
    <AdvancedTable<Student>
      data={students}
      columns={getStudentColumns(onViewStudent)}
      rowDecorations={studentRowDecorations}
      title={title}
      subtitle={subtitle}
      icon={<Users className="h-5 w-5 text-blue-600" />}
      idField="id"
      onAddRow={onAddStudent}
      editable
      enableSelection
      enableBulkActions
      enableSearch
      enableFiltering
      enableSorting
      enableColumnVisibility
      enableExport
      enableValidation
      enableRowNumbers
      enableStatusBar
      pageSize={20}
      stickyHeader
      theme="industrial"
    />
  );
}
