"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronLeft, History } from "lucide-react";
import { useGrades } from "@/hooks/useGrades";
import { useSections } from "@/hooks/useSections";
import { useCreateStudent } from "@/hooks/useStudents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/components/students/student-form";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";
import type { Student } from "@/types/models";

export default function AddStudentPage() {
  const router = useRouter();
  const { data: grades = [] } = useGrades();
  const { data: sections = [] } = useSections();
  const createStudentMutation = useCreateStudent();
  
  const [recentlyAdded, setRecentlyAdded] = useState<Partial<Student>[]>([]);
  const [formKey, setFormKey] = useState(0);

  const handleSaveStudent = (payload: any) => {
    createStudentMutation.mutate(payload, {
      onSuccess: (data) => {
        // Add to recently added
        setRecentlyAdded((prev) => [data, ...prev].slice(0, 3));
        // Reset form by changing key
        setFormKey(prev => prev + 1);
      },
    });
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title="Register New Student"
        subtitle="Add a new student to the system."
        icon={Users}
        actions={
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentForm
                key={formKey}
                grades={grades.map((g) => ({
                  id: g.id,
                  name: g.nameSi || g.nameEn,
                }))}
                sections={sections.map((s) => ({
                  id: s.id,
                  name: s.nameSi || s.nameEn,
                }))}
                onSubmit={handleSaveStudent}
                isLoading={createStudentMutation.isPending}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Recently Added
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentlyAdded.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No students added yet in this session.
                </div>
              ) : (
                <div className="space-y-4">
                  {recentlyAdded.map((student, index) => (
                    <div key={index} className="p-3 bg-slate-50 rounded-lg border">
                      <div className="font-medium text-slate-900">
                        {student.firstNameEn} {student.lastNameEn}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {student.admissionNumber}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutController>
  );
}
