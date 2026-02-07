"use client"
import { useState } from "react"
import { LayoutController, type LayoutTab } from "@/components/layout"
import { StudentBasicInfo } from "@/components/students/student-tabs/basic-info"
import { StudentTalents } from "@/components/students/student-tabs/talents"
import { StudentNotes } from "@/components/students/student-tabs/notes"
import { StudentAttendanceTab } from "@/components/students/student-tabs/attendance"
import type { Student } from "@/lib/school-data"
import { StudentAvatar } from "@/components/students/student-avatar"
import { User, Star, FileText, Crown, Activity } from "lucide-react"

interface StudentDetailsPageProps {
  student: Student
  onUpdate: (student: Student) => void
  onClose: () => void
  onBack?: () => void
}

export function StudentDetailsPage({ student, onUpdate, onClose, onBack }: StudentDetailsPageProps) {
  const [editingStudent, setEditingStudent] = useState(student)

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
      talents: [...editingStudent.talents, { ...talent, id: Date.now().toString() }],
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleRemoveTalent = (talentId: string) => {
    const updated = {
      ...editingStudent,
      talents: editingStudent.talents.filter((t) => t.id !== talentId),
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleAddNote = (note: any) => {
    const updated = {
      ...editingStudent,
      notes: [
        ...editingStudent.notes,
        { ...note, id: Date.now().toString(), date: new Date().toISOString().split("T")[0] },
      ],
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const handleDeleteNote = (noteId: string) => {
    const updated = {
      ...editingStudent,
      notes: editingStudent.notes.filter((n) => n.id !== noteId),
    }
    setEditingStudent(updated)
    onUpdate(updated)
  }

  const tabs: LayoutTab[] = [
    {
      id: "basic-info",
      label: "Basic Information",
      icon: <User className="h-4 w-4" />,
      component: () => <StudentBasicInfo student={editingStudent} onSave={handleSaveBasicInfo} />,
    },
    {
      id: "roles",
      label: "Roles & Responsibilities",
      icon: <Crown className="h-4 w-4" />,
      component: () => <RolesAndResponsibilities studentId={editingStudent.id} student={editingStudent} />,
    },
    {
      id: "talents",
      label: "Talents & Skills",
      icon: <Star className="h-4 w-4" />,
      component: () => (
        <StudentTalents
          talents={editingStudent.talents}
          onAddTalent={handleAddTalent}
          onRemoveTalent={handleRemoveTalent}
        />
      ),
      badge: editingStudent.talents.length,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: <Activity className="h-4 w-4" />,
      component: () => <StudentAttendanceTab student={editingStudent} />,
    },
    {
      id: "notes",
      label: "Notes & Remarks",
      icon: <FileText className="h-4 w-4" />,
      component: () => (
        <StudentNotes notes={editingStudent.notes} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} />
      ),
      badge: editingStudent.notes.length,
    },
  ]

  return (
    <LayoutController
      title={`${editingStudent.firstName} ${editingStudent.lastName}`}
      subtitle={`Roll No: ${editingStudent.admissionNumber} | Grade: ${editingStudent.gradeId && typeof editingStudent.gradeId === 'object' ? editingStudent.gradeId.nameEn : editingStudent.gradeId || "N/A"}`}
      icon={
        <StudentAvatar 
          studentId={editingStudent.id}
          photoUrl={editingStudent.photoUrl}
          firstName={editingStudent.firstName}
          lastName={editingStudent.lastName}
          onUpdate={handlePhotoUpdate}
        />
      }
      tabs={tabs}
      defaultTabId="basic-info"
      onClose={onClose}
      onBack={onBack}
      backButton={true}
      headerBackground="bg-white border-b border-slate-200"
    />
  )
}

function RolesAndResponsibilities({ studentId, student }: { studentId: string; student: Student }) {
  // In a real app, these would be fetched from global state or database
  const [prefectData] = useState(() => {
    // Simulate checking if student is a prefect by their ID hash
    const isPrefect = Math.abs(Number.parseInt(studentId.split("-").pop() || "0")) % 4 === 0
    return {
      isPrefect,
      rank: ["prefect", "vice-prefect", "head-prefect"][
        Math.abs(Number.parseInt(studentId.split("-").pop() || "0")) % 3
      ] as "prefect" | "vice-prefect" | "head-prefect",
      appointmentDate: isPrefect ? new Date(2024, 3, 15).toISOString().split("T")[0] : undefined,
      responsibilities: isPrefect ? ["Roll Call During Assembly", "Classroom Cleanliness", "Behavior Monitoring"] : [],
    }
  })

  const [clubData] = useState(() => {
    // Simulate club memberships
    const clubCount = Math.abs(Number.parseInt(studentId.split("-").pop() || "0")) % 3
    const clubs = []
    const allClubs = [
      { name: "Science Club", role: "member" },
      { name: "Debate Society", role: "president" },
      { name: "Sports Club", role: "vice-president" },
    ]
    for (let i = 0; i < clubCount; i++) {
      clubs.push(allClubs[i])
    }
    return clubs
  })

  const [houseData] = useState(() => {
    // Simulate house assignment
    const houses = ["Red House", "Blue House", "Green House", "Yellow House"]
    const houseIndex = Math.abs(Number.parseInt(studentId.split("-").pop() || "0")) % 4
    return {
      houseName: houses[houseIndex],
      position: ["member", "leader"][Math.abs(Number.parseInt(studentId.split("-").pop() || "0")) % 2],
    }
  })

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Prefect Status</h3>

        {prefectData.isPrefect ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👑</div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Prefect Rank</p>
                  <p className="text-lg font-bold text-blue-600 capitalize">{prefectData.rank}</p>
                </div>
              </div>
            </div>

            {prefectData.appointmentDate && (
              <div className="bg-slate-50 p-3 rounded">
                <p className="text-sm text-slate-600">
                  <span className="font-medium">Appointment Date:</span>{" "}
                  {new Date(prefectData.appointmentDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {prefectData.responsibilities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-900 mb-2">Assigned Responsibilities</p>
                <ul className="space-y-2">
                  {prefectData.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-blue-600 font-bold mt-0.5">✓</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded text-center">
            <p className="text-sm text-slate-600">Not currently assigned as a prefect</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">House Information</h3>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-2xl">🏠</div>
            <p className="text-lg font-bold text-amber-900">{houseData.houseName}</p>
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Position:</span>
            <span className="ml-2 inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-medium capitalize">
              {houseData.position}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Club Memberships</h3>

        {clubData.length > 0 ? (
          <div className="space-y-3">
            {clubData.map((club, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-900">{club.name}</p>
                  <p className="text-xs text-slate-600">Joined: {new Date().getFullYear()}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    club.role === "president"
                      ? "bg-purple-100 text-purple-800"
                      : club.role === "vice-president"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {club.role.replace("-", " ")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded text-center">
            <p className="text-sm text-slate-600">Not a member of any clubs</p>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3">Role Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{prefectData.isPrefect ? "1" : "0"}</p>
            <p className="text-xs text-slate-600 mt-1">Prefect Roles</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">{clubData.length}</p>
            <p className="text-xs text-slate-600 mt-1">Club Memberships</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-600">{prefectData.responsibilities.length}</p>
            <p className="text-xs text-slate-600 mt-1">Responsibilities</p>
          </div>
        </div>
      </div>
    </div>
  )
}
