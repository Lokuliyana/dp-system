"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Users, Save, Printer, Trash2, User, Calendar, FileText, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { toast } from "sonner";

import { useStudent360, useDeleteStudent, useUpdateStudent } from "@/hooks/useStudents";
import { useGrades } from "@/hooks/useGrades";
import { useClubPositions } from "@/hooks/useClubs";
import { Button } from "@/components/ui/button";
import {
  LayoutController,
  DynamicPageHeader,
  VerticalToolbar,
} from "@/components/layout/dynamic";
import { StudentsMenu } from "@/components/students/students-menu";

import { StudentSummaryHeader } from "@/components/students/details/StudentSummaryHeader";

import { BasicInfoSection } from "@/components/students/tabs/BasicInfoSection";
import { AttendanceTab } from "@/components/students/tabs/AttendanceTab";
import { NotesTab } from "@/components/students/tabs/NotesTab";
import { TalentsSection } from "@/components/students/tabs/TalentsSection";
import { RolesAndActivitiesTab } from "@/components/students/tabs/RolesAndActivitiesTab";

import type { Student } from "@/types/models";

interface StudentPageProps {
  params: {
    gradeId: string;
    studentId: string;
  };
}

export default function StudentDetailPage({ params }: StudentPageProps) {
  const router = useRouter();
  const { gradeId, studentId } = params;

  const { data: grades = [] } = useGrades();
  const { data: student360, isLoading, refetch } = useStudent360(studentId);
  const { data: positions = [] } = useClubPositions();
  const deleteStudentMutation = useDeleteStudent(gradeId);

  const grade = grades.find((g) => g.id === gradeId);
  const [activeTab, setActiveTab] = useState<"basic" | "attendance" | "notes" | "talents" | "roles">("basic");
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const updateStudentMutation = useUpdateStudent();

  useEffect(() => {
    if (student360?.student && !isInitialized) {
      setFormData(student360.student);
      setIsInitialized(true);
    }
  }, [student360, isInitialized]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <Users className="mr-2 h-6 w-6 animate-spin" />
        Loading student profile...
      </div>
    );
  }

  if (!student360 || !student360.student) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <p className="text-lg font-semibold">Student not found</p>
        <Button onClick={() => router.push(`/students/${gradeId}`)}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to student list
        </Button>
      </div>
    );
  }

  const { student, attendance, notes, talents, houseHistory, competitions, clubs, prefectHistory } = student360;

  const handleSave = () => {
    // Clean data before sending to API
    const payload: any = { ...formData };
    
    // Ensure gradeId is a string ID
    if (payload.gradeId && typeof payload.gradeId === 'object') {
      payload.gradeId = payload.gradeId._id || payload.gradeId.id;
    }

    // Explicitly ensure photoUrl is passed if it exists in student or formData
    if (student.photoUrl && !payload.photoUrl) {
      payload.photoUrl = student.photoUrl;
    }

    // Remove read-only or complex fields that might break the backend
    delete payload._id;
    delete payload.id;
    delete payload.schoolId;
    delete payload.createdAt;
    delete payload.updatedAt;
    delete payload.notes;
    delete payload.emergencyContacts;

    updateStudentMutation.mutate({
      id: studentId,
      payload
    }, {
      onSuccess: () => {
        toast.success("Student updated successfully");
        refetch();
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to update student");
      }
    });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this student?")) {
      deleteStudentMutation.mutate(studentId, {
        onSuccess: () => {
          router.push(`/students/${gradeId}`);
        },
      });
    }
  };

  return (
    <LayoutController showMainMenu showHorizontalToolbar showVerticalToolbar>
      <StudentsMenu />

      <DynamicPageHeader
        title={`${student.firstNameSi || student.firstNameEn} ${student.lastNameSi || student.lastNameEn}`}
        subtitle={`Grade: ${grade?.nameSi || grade?.nameEn || "Unknown"} • Admission No: ${student.admissionNumber}`}
        icon={Users}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/students/${gradeId}`)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSave}
              disabled={updateStudentMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <VerticalToolbar>
        <Button
          variant="ghost"
          size="icon"
          title="Basic Info"
          onClick={() => setActiveTab("basic")}
          className={cn(activeTab === "basic" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <User className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Attendance"
          onClick={() => setActiveTab("attendance")}
          className={cn(activeTab === "attendance" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <Calendar className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Notes"
          onClick={() => setActiveTab("notes")}
          className={cn(activeTab === "notes" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Talents"
          onClick={() => setActiveTab("talents")}
          className={cn(activeTab === "talents" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <Star className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Roles & Activities"
          onClick={() => setActiveTab("roles")}
          className={cn(activeTab === "roles" ? "text-purple-600 bg-purple-50" : "text-slate-500")}
        >
          <Trophy className="h-4 w-4" />
        </Button>
      </VerticalToolbar>

      <div className="p-6 space-y-8">
        <StudentSummaryHeader 
          student={{ ...student, ...formData } as Student} 
          gradeName={grade?.nameEn || grade?.nameSi}
          onUpdate={(updated) => {
            setFormData(prev => ({ ...prev, ...updated }));
            // We still trigger the save for immediate photo update if StudentAvatar does it,
            // but here we just update the local state to stay in sync.
          }}
        />

        <div className="pt-2">
          {activeTab === "basic" && (
            <BasicInfoSection 
              student={{ ...student, ...formData } as Student} 
              onSave={handleSave} 
              onChange={(updated) => setFormData(prev => ({ ...prev, ...updated }))}
            />
          )}

          {activeTab === "attendance" && <AttendanceTab student={student as Student} attendanceData={attendance} />}

          {activeTab === "notes" && (
            <NotesTab
              notes={notes || []} // Use notes from 360 response (or student.notes)
              onAddNote={() => {}}
              onDeleteNote={() => {}}
            />
          )}

          {activeTab === "talents" && (
            <TalentsSection
              talents={talents || []}
              onAddTalent={() => {}}
              onRemoveTalent={() => {}}
            />
          )}

          {activeTab === "roles" && (
            <RolesAndActivitiesTab
              student={student as Student}
              clubs={(clubs || []).map((c: any) => {
                const member = c.members?.find((m: any) => m.studentId === studentId);
                const position = positions.find((p) => p.id === member?.positionId);
                return {
                  id: c.id,
                  name: c.nameEn,
                  role: position ? position.nameEn : "Member",
                  year: c.year,
                  isActive: true,
                };
              })}
              activities={competitions || []}
              houseHistory={houseHistory || []}
              houseWins={[]} // Add if available in 360
            />
          )}
        </div>
      </div>
    </LayoutController>
  );
}
