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
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                type="email"
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <Input
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                type="date"
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Academic Performance</label>
              <Select
                value={formData.academicPerformance}
                onValueChange={(value) => handleChange("academicPerformance", value)}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Roll Number</label>
              <Input
                value={formData.rollNumber}
                onChange={(e) => handleChange("rollNumber", Number.parseInt(e.target.value))}
                type="number"
                className="bg-white border-slate-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parent/Guardian Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Name</label>
              <Input
                value={formData.parentName}
                onChange={(e) => handleChange("parentName", e.target.value)}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Parent Phone</label>
              <Input
                value={formData.parentPhone}
                onChange={(e) => handleChange("parentPhone", e.target.value)}
                className="bg-white border-slate-200"
              />
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
