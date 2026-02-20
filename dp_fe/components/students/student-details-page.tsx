"use client"
import { useState } from "react"
import { LayoutController, type LayoutTab } from "@/components/layout"
import { StudentBasicInfo } from "@/components/students/student-tabs/basic-info"
import { StudentTalents } from "@/components/students/student-tabs/talents"
import { StudentNotes } from "@/components/students/student-tabs/notes"
import { StudentAttendanceTab } from "@/components/students/student-tabs/attendance"
import { StudentExamsTab } from "@/components/students/student-tabs/exams"
import { OverviewTab } from "@/components/students/student-tabs/overview"
import { StudentActivityPortfolio } from "@/components/students/student-tabs/activity-portfolio"
import type { Student, Student360 } from "@/types/models"
import { StudentAvatar } from "@/components/students/student-avatar"
import { User, Star, FileText, Crown, Activity, Trophy, LayoutDashboard, Loader, History, Users } from "lucide-react"
import { useStudent360 } from "@/hooks/useStudents"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, Separator } from "@/components/ui"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface StudentDetailsPageProps {
  student: Student
  onUpdate: (student: Student) => void
  onClose: () => void
  onBack?: () => void
}

export function StudentDetailsPage({ student, onUpdate, onClose, onBack }: StudentDetailsPageProps) {
  const [editingStudent, setEditingStudent] = useState(student)
  const studentId = student.id || (student as any)._id;
  const { data: viewData, isLoading } = useStudent360(studentId);

  const handleSaveBasicInfo = (updatedStudent: Student) => {
    setEditingStudent(updatedStudent)
    onUpdate(updatedStudent)
  }

  const handlePhotoUpdate = (photoUrl: string) => {
    const updated = { ...editingStudent, photoUrl }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleAddTalent = (talent: any) => {
    const updated = {
      ...editingStudent,
      talents: [...(editingStudent.talents || []), { ...talent, id: Date.now().toString() }],
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleRemoveTalent = (talentId: string) => {
    const updated = {
      ...editingStudent,
      talents: (editingStudent.talents || []).filter((t) => (t as any).id !== talentId),
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleAddNote = (note: any) => {
    const updated = {
      ...editingStudent,
      notes: [
        ...(editingStudent.notes || []),
        { ...note, id: Date.now().toString(), date: new Date().toISOString().split("T")[0] },
      ],
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleDeleteNote = (noteId: string) => {
    const updated = {
      ...editingStudent,
      notes: (editingStudent.notes || []).filter((n) => (n as any).id !== noteId),
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
        <Loader className="h-4 w-4 animate-spin" /> Gathering 360 data...
      </div>
    );
  }

  const tabs: LayoutTab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      component: () => <OverviewTab data={viewData} />,
    },
    {
      id: "basic-info",
      label: "Basic Information",
      icon: <User className="h-4 w-4" />,
      component: () => <StudentBasicInfo student={editingStudent as any} onSave={handleSaveBasicInfo as any} />,
    },
    {
      id: "roles",
      label: "Portfolio & Activities",
      icon: <LayoutDashboard className="h-4 w-4" />,
      component: () => <StudentActivityPortfolio data={viewData} />,
    },
    {
      id: "talents",
      label: "Talents & Skills",
      icon: <Star className="h-4 w-4" />,
      component: () => (
        <StudentTalents
          talents={editingStudent.talents || []}
          onAddTalent={handleAddTalent}
          onRemoveTalent={handleRemoveTalent}
        />
      ),
      badge: (editingStudent.talents || []).length,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <Activity className="h-4 w-4" />,
      component: () => <StudentAttendanceTab student={editingStudent as any} />,
    },
    {
      id: "exams",
      label: "Exams",
      icon: <Trophy className="h-4 w-4" />,
      component: () => <StudentExamsTab student={editingStudent as any} />,
    },
    {
      id: "notes",
      label: "Notes & Remarks",
      icon: <FileText className="h-4 w-4" />,
      component: () => (
        <StudentNotes notes={(editingStudent as any).notes || []} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
      ),
      badge: (editingStudent.notes || []).length,
    },
  ]

  return (
    <LayoutController
      title={editingStudent.nameWithInitialsSi || `${editingStudent.fullNameEn}`}
      subtitle={`Roll No: ${editingStudent.admissionNumber} | Grade: ${editingStudent.gradeId && typeof editingStudent.gradeId === 'object' ? (editingStudent.gradeId as any).nameEn : editingStudent.gradeId || "N/A"}`}
      icon={
        <StudentAvatar 
          studentId={(editingStudent as any).id || (editingStudent as any)._id}
          photoUrl={editingStudent.photoUrl}
          firstName={editingStudent.fullNameEn?.split(' ')[0] || editingStudent.firstNameSi || "S"}
          lastName={editingStudent.fullNameEn?.split(' ').slice(1).join(' ') || editingStudent.lastNameSi || "T"}
          onUpdate={handlePhotoUpdate}
        />
      }
      tabs={tabs}
      defaultTabId="overview"
      onClose={onClose}
      onBack={onBack}
      backButton={true}
      headerBackground="bg-white border-b border-slate-200"
    />
  )
}

