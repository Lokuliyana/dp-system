"use client";

import { Eye, Pencil } from "lucide-react";

import type { Student } from "@/types/models";
import type { TableColumn, RowDecoration } from "@/components/reusable";
import { Button } from "@/components/ui";

export const getStudentColumns = (
  onView: (s: Student) => void,
  onEdit: (s: Student) => void
): TableColumn<Student>[] => [
  {
    key: "admissionNumber",
    label: "Admission No",
    type: "text",
    sortable: true,
    filterable: true,
    width: "140px",
    frozen: true,
  },
  {
    key: "fullNameEn",
    label: "Full Name (En)",
    type: "text",
    sortable: true,
    filterable: true,
    width: "200px",
  },
  {
    key: "nameWithInitialsSi",
    label: "Name w/ Initials (Si)",
    type: "text",
    sortable: true,
    filterable: true,
    width: "200px",
  },
  {
    key: "sex",
    label: "Sex",
    type: "text",
    sortable: true,
    filterable: true,
    width: "100px",
  },
  {
    key: "dob",
    label: "DOB",
    type: "date",
    sortable: true,
    filterable: true,
    width: "140px",
  },
  {
    key: "phoneNum",
    label: "Phone",
    type: "text",
    sortable: true,
    filterable: true,
    width: "150px",
  },
  {
    key: "id",
    label: "Actions",
    type: "custom",
    sortable: false,
    filterable: false,
    editable: false,
    width: "100px",
    render: (_value: unknown, row: Student) => (
      <div className="flex gap-1">
        <Button
          type="button"
          onClick={() => onView(row)}
          variant="ghost"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="View student details"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          onClick={() => onEdit(row)}
          variant="ghost"
          size="sm"
          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          title="Edit student details"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export const studentRowDecorations: RowDecoration<Student>[] = [
  // Add decorations based on real data if needed, e.g. risk stage
];
