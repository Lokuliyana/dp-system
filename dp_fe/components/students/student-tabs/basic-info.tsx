"use client"

import type { Student } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { useState } from "react"
import { Save } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"

interface BasicInfoProps {
  student: Student
  onSave: (student: Student) => void
}

export function StudentBasicInfo({ student, onSave }: BasicInfoProps) {
  const [formData, setFormData] = useState(student)

  const handleChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="grid gap-6 max-w-4xl">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name (English)</label>
              <Input
                value={formData.fullNameEn}
                onChange={(e) => handleChange("fullNameEn", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name (Sinhala)</label>
              <Input
                value={formData.fullNameSi}
                onChange={(e) => handleChange("fullNameSi", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Name with Initials (Sinhala)</label>
              <Input
                value={formData.nameWithInitialsSi}
                onChange={(e) => handleChange("nameWithInitialsSi", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Admission Number</label>
              <Input
                value={formData.admissionNumber}
                onChange={(e) => handleChange("admissionNumber", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <Input
                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                onChange={(e) => handleChange("dob", e.target.value)}
                type="date"
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Sex</label>
              <Select value={formData.sex} onValueChange={(value) => handleChange("sex", value)}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Birth Certificate Number</label>
              <Input
                value={formData.birthCertificateNumber || ''}
                onChange={(e) => handleChange("birthCertificateNumber", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Admitted Grade</label>
              <Input
                value={formData.admittedGrade || ''}
                onChange={(e) => handleChange("admittedGrade", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Medium</label>
              <Select value={formData.medium} onValueChange={(value) => handleChange("medium", value)}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sinhala">Sinhala</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Academic Year</label>
              <Input
                value={formData.academicYear}
                onChange={(e) => handleChange("academicYear", Number.parseInt(e.target.value))}
                type="number"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address (English)</label>
              <Input
                value={formData.addressEn || ''}
                onChange={(e) => handleChange("addressEn", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address (Sinhala)</label>
              <Input
                value={formData.addressSi || ''}
                onChange={(e) => handleChange("addressSi", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <Input
                value={formData.phoneNum || ''}
                onChange={(e) => handleChange("phoneNum", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
              <Input
                value={formData.whatsappNumber || ''}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Emergency Number</label>
              <Input
                value={formData.emergencyNumber || ''}
                onChange={(e) => handleChange("emergencyNumber", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                value={formData.email || ''}
                onChange={(e) => handleChange("email", e.target.value)}
                type="email"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Parent Information */}
      <Card>
        <CardHeader>
          <CardTitle>Parent Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Mother */}
            <div className="space-y-4 p-4 border rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground">Mother</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name (English)</label>
                <Input
                  value={formData.motherNameEn || ''}
                  onChange={(e) => handleChange("motherNameEn", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input
                  value={formData.motherNumber || ''}
                  onChange={(e) => handleChange("motherNumber", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Occupation</label>
                <Input
                  value={formData.motherOccupation || ''}
                  onChange={(e) => handleChange("motherOccupation", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>

            {/* Father */}
            <div className="space-y-4 p-4 border rounded-md">
              <h4 className="font-medium text-sm text-muted-foreground">Father</h4>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Name (English)</label>
                <Input
                  value={formData.fatherNameEn || ''}
                  onChange={(e) => handleChange("fatherNameEn", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone</label>
                <Input
                  value={formData.fatherNumber || ''}
                  onChange={(e) => handleChange("fatherNumber", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Occupation</label>
                <Input
                  value={formData.fatherOccupation || ''}
                  onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 w-full md:w-auto gap-2">
        <Save className="h-4 w-4" />
        Save Changes
      </Button>
    </div>
  )
}
