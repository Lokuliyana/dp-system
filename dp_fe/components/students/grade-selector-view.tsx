"use client";

import { PageHeader, PageContainer, GradeSelector } from "@/components/reusable";
import { Users } from "lucide-react";

interface Props {
  studentCountsByGrade: Record<string, number>;
  onSelect: (id: string) => void;
}

export function GradeSelectorView({ studentCountsByGrade, onSelect }: Props) {
  return (
    <>
      <PageHeader
        title="Student Management"
        description="Manage all students across grades"
        icon={<Users className="h-6 w-6" />}
      />
      <PageContainer>
        <GradeSelector
          onSelectGrade={onSelect}
          studentCountsByGrade={studentCountsByGrade}
        />
      </PageContainer>
    </>
  );
}
