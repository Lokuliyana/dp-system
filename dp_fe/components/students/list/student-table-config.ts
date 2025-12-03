// components/list/student-table-config.ts
// Pure config + factories. No JSX here to keep it .ts-safe.

import type { ReactNode } from "react";
import React from "react";
import type { Student } from "@/lib/school-data";
import type {
  TableColumn,
  RowDecoration,
} from "@/components/reusable";
import { Button } from "@/components/ui";
import { Eye } from "lucide-react";

export function getStudentColumns(
  onViewStudent: (student: Student) => void,
): TableColumn<Student>[] {
  const cols: TableColumn<Student>[] = [
    {
      key: "rollNumber",
      label: "Roll No",
      type: "number",
      sortable: true,
      filterable: true,
      editable: false,
      width: "80px",
      frozen: true,
    },
    {
      key: "firstName",
      label: "First Name",
      type: "text",
      sortable: true,
      filterable: true,
      editable: true,
      width: "150px",
      required: true,
    },
    {
      key: "lastName",
      label: "Last Name",
      type: "text",
      sortable: true,
      filterable: true,
      editable: true,
      width: "150px",
      required: true,
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      sortable: true,
      filterable: true,
      editable: true,
      width: "220px",
    },
    {
      key: "phoneNumber",
      label: "Phone",
      type: "text",
      sortable: true,
      filterable: true,
      editable: true,
      width: "130px",
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: ["active", "inactive", "transferred", "graduated"],
      sortable: true,
      filterable: true,
      editable: true,
      width: "120px",
    },
    {
      key: "academicPerformance",
      label: "Performance",
      type: "select",
      options: ["excellent", "good", "average", "needs-improvement"],
      sortable: true,
      filterable: true,
      editable: true,
      width: "140px",
    },
    {
      key: "id",
      label: "Actions",
      type: "custom",
      sortable: false,
      filterable: false,
      editable: false,
      width: "90px",
      render: (_value: unknown, row: Student): ReactNode =>
        React.createElement(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            className:
              "gap-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700",
            onClick: () => onViewStudent(row),
            title: "View student details",
          },
          React.createElement(Eye, { className: "h-4 w-4" }),
        ),
    },
  ];

  return cols;
}

export const studentRowDecorations: RowDecoration<Student>[] = [
  {
    condition: (row) => row.status === "inactive",
    className: "opacity-60",
    style: { backgroundColor: "rgba(239,68,68,0.04)" },
    priority: 3,
    tooltip: "Inactive student",
  },
  {
    condition: (row) => row.academicPerformance === "excellent",
    className: "border-l-4 border-l-emerald-500",
    priority: 2,
    tooltip: "Excellent performance",
  },
];
