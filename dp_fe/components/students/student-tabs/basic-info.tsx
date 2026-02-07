"use client"

import { useState } from "react"
import type { Student } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui/badge"
import { Save, User, GraduationCap, MapPin, Phone, Mail, Users, FileText, UserCheck, UserX, Info } from "lucide-react"
import { StudentAvatar } from "@/components/students/student-avatar"
import { StudentStatusDialog } from "@/components/students/student-status-dialog"
import { cn } from "@/lib/utils"

interface BasicInfoProps {
  student: Student
  onSave: (student: Student) => void
}

export function StudentBasicInfo({ student, onSave }: BasicInfoProps) {
  const [formData, setFormData] = useState(student)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)

  const handleChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(formData)
  }

  const handlePhotoUpdate = (photoUrl: string) => {
    setFormData((prev) => ({ ...prev, photoUrl }))
  }

  const handleStatusUpdate = (note: string) => {
    const targetStatus = (formData.status === "active" ? "inactive" : "active") as Student["status"]
    const updatedData = {
      ...formData,
      status: targetStatus,
      [targetStatus === "active" ? "activeNote" : "inactiveNote"]: note,
    }
    setFormData(updatedData)
    setIsStatusDialogOpen(false)
    onSave(updatedData)
  }

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Profile Header & Status Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm border-l-4 border-l-blue-600">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Left: Avatar & Primary Data */}
            <div className="p-6 md:w-1/3 flex flex-col items-center justify-center bg-slate-50/50">
              <StudentAvatar 
                studentId={formData.id}
                photoUrl={formData.photoUrl}
                firstName={formData.firstName}
                lastName={formData.lastName}
                onUpdate={handlePhotoUpdate}
              />
              <div className="mt-4 text-center">
                <h3 className="font-bold text-xl text-slate-900 leading-tight">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-sm text-slate-500 font-medium">{formData.admissionNumber}</p>
              </div>
            </div>

            {/* Right: Status & Quick Controls */}
            <div className="p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Status</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={formData.status === "active" ? "default" : "destructive"}
                      className={cn(
                        "px-3 py-0.5 text-xs font-semibold capitalize",
                        formData.status === "active" ? "bg-emerald-600 hover:bg-emerald-700" : ""
                      )}
                    >
                      {formData.status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStatusDialogOpen(true)}
                  className="h-9 px-4 border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  {formData.status === "active" ? (
                    <>
                      <UserX className="mr-2 h-4 w-4 text-red-500" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                      Activate
                    </>
                  )}
                </Button>
              </div>

              {(formData.activeNote || formData.inactiveNote) && (
                <div className="bg-white border border-slate-200 rounded-lg p-3 relative group">
                  <Info className="absolute top-2 right-2 h-3.5 w-3.5 text-slate-300" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Latest Update Note</p>
                  <p className="text-xs text-slate-600 italic line-clamp-2 leading-relaxed">
                    &quot;{formData.activeNote || formData.inactiveNote}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Detailed Information Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details Row */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-base">Personal Identification</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <FormGroup label="Full Name (English)">
              <Input
                value={formData.fullNameEn}
                onChange={(e) => handleChange("fullNameEn", e.target.value)}
                className="bg-white"
              />
            </FormGroup>
            <FormGroup label="Full Name (Sinhala)">
              <Input
                value={formData.fullNameSi}
                onChange={(e) => handleChange("fullNameSi", e.target.value)}
                className="bg-white"
              />
            </FormGroup>
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Admission No">
                <Input
                  value={formData.admissionNumber}
                  onChange={(e) => handleChange("admissionNumber", e.target.value)}
                  className="bg-white font-mono text-xs"
                />
              </FormGroup>
              <FormGroup label="Birth Cert No">
                <Input
                  value={formData.birthCertificateNumber || ''}
                  onChange={(e) => handleChange("birthCertificateNumber", e.target.value)}
                  className="bg-white"
                />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormGroup label="Date of Birth">
                <Input
                  value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                  onChange={(e) => handleChange("dob", e.target.value)}
                  type="date"
                  className="bg-white"
                />
              </FormGroup>
              <FormGroup label="Gender">
                <Select value={formData.sex} onValueChange={(value) => handleChange("sex", value)}>
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* Academic Details Row */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 rounded-md">
                <GraduationCap className="h-4 w-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base">Academic Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <FormGroup label="Current Academic Year">
              <Input
                value={formData.academicYear}
                onChange={(e) => handleChange("academicYear", Number.parseInt(e.target.value))}
                type="number"
                className="bg-white"
              />
            </FormGroup>
            <FormGroup label="Admitted Grade">
              <Input
                value={formData.admittedGrade || ''}
                onChange={(e) => handleChange("admittedGrade", e.target.value)}
                className="bg-white"
              />
            </FormGroup>
            <FormGroup label="Medium of Instruction">
              <Select value={formData.medium} onValueChange={(value) => handleChange("medium", value)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sinhala">Sinhala (SIN)</SelectItem>
                  <SelectItem value="english">English (ENG)</SelectItem>
                  <SelectItem value="tamil">Tamil (TAM)</SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-md">
                <MapPin className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-base">Contact & Residential Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <FormGroup label="Residential Address (English)">
                  <Input
                    value={formData.addressEn || ''}
                    onChange={(e) => handleChange("addressEn", e.target.value)}
                    className="bg-white"
                  />
                </FormGroup>
                <FormGroup label="Residential Address (Sinhala)">
                  <Input
                    value={formData.addressSi || ''}
                    onChange={(e) => handleChange("addressSi", e.target.value)}
                    className="bg-white"
                  />
                </FormGroup>
                <FormGroup label="Student Personal Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.email || ''}
                      onChange={(e) => handleChange("email", e.target.value)}
                      type="email"
                      className="pl-10 bg-white"
                      placeholder="student@example.com"
                    />
                  </div>
                </FormGroup>
              </div>
              <div className="space-y-4">
                <FormGroup label="Primary Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      value={formData.phoneNum || ''}
                      onChange={(e) => handleChange("phoneNum", e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                </FormGroup>
                <FormGroup label="WhatsApp Number">
                  <Input
                    value={formData.whatsappNumber || ''}
                    onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                    className="bg-white"
                    placeholder="Enter with country code"
                  />
                </FormGroup>
                <FormGroup label="Emergency Contact Number">
                  <Input
                    value={formData.emergencyNumber || ''}
                    onChange={(e) => handleChange("emergencyNumber", e.target.value)}
                    className="bg-white border-red-100 focus-visible:ring-red-200"
                  />
                </FormGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Parent Details Sections */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-md">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <CardTitle className="text-base">Guardian & Parent Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Mother */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-semibold text-slate-900">Maternal Information</h4>
                </div>
                <FormGroup label="Mother's Name (En)">
                  <Input
                    value={formData.motherNameEn || ''}
                    onChange={(e) => handleChange("motherNameEn", e.target.value)}
                    className="bg-white"
                  />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Phone">
                    <Input
                      value={formData.motherNumber || ''}
                      onChange={(e) => handleChange("motherNumber", e.target.value)}
                      className="bg-white"
                    />
                  </FormGroup>
                  <FormGroup label="Occupation">
                    <Input
                      value={formData.motherOccupation || ''}
                      onChange={(e) => handleChange("motherOccupation", e.target.value)}
                      className="bg-white"
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Father */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-semibold text-slate-900">Paternal Information</h4>
                </div>
                <FormGroup label="Father's Name (En)">
                  <Input
                    value={formData.fatherNameEn || ''}
                    onChange={(e) => handleChange("fatherNameEn", e.target.value)}
                    className="bg-white"
                  />
                </FormGroup>
                <div className="grid grid-cols-2 gap-4">
                  <FormGroup label="Phone">
                    <Input
                      value={formData.fatherNumber || ''}
                      onChange={(e) => handleChange("fatherNumber", e.target.value)}
                      className="bg-white"
                    />
                  </FormGroup>
                  <FormGroup label="Occupation">
                    <Input
                      value={formData.fatherOccupation || ''}
                      onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                      className="bg-white"
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-400 font-medium">
          Make sure to verify information before saving critical records.
        </p>
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5 transition-all duration-200 gap-2 h-10 px-8"
        >
          <Save className="h-4 w-4" />
          Commit Changes
        </Button>
      </div>

      <StudentStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleStatusUpdate}
        targetStatus={formData.status === "active" ? "inactive" : "active"}
      />
    </div>
  )
}

function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1 font-sans">
        {label}
      </label>
      {children}
    </div>
  )
}
