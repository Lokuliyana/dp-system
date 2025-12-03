"use client"

import type React from "react"

import { useState } from "react"
import { type Student, GRADES } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { Label } from "@/components/ui"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Alert, AlertDescription } from "@/components/ui"
import { Save, X, AlertCircle, CheckCircle } from "lucide-react"

interface StudentRegistrationFormProps {
  gradeId: string
  onSubmit: (student: Partial<Student>) => void
  onCancel?: () => void
  initialData?: Partial<Student>
  isEditing?: boolean
}

interface FormErrors {
  [key: string]: string
}

export function StudentRegistrationForm({
  gradeId,
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
}: StudentRegistrationFormProps) {
  const [formData, setFormData] = useState<Partial<Student>>(
    initialData || {
      gradeId,
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      dateOfBirth: "",
      enrollmentDate: new Date().toISOString().split("T")[0],
      parentName: "",
      parentPhone: "",
      address: "",
      status: "active",
      academicPerformance: "average",
    },
  )

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required"
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required"
    }
    if (!formData.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phoneNumber?.trim()) {
      newErrors.phoneNumber = "Phone number is required"
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required"
    }
    if (!formData.parentName?.trim()) {
      newErrors.parentName = "Parent name is required"
    }
    if (!formData.parentPhone?.trim()) {
      newErrors.parentPhone = "Parent phone is required"
    }
    if (!formData.address?.trim()) {
      newErrors.address = "Address is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      setSubmitMessage({
        type: "error",
        message: "Please fix the errors above and try again",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const studentData: Partial<Student> = {
        ...formData,
        rollNumber: initialData?.rollNumber || 0,
      }

      onSubmit(studentData)
      setSubmitMessage({
        type: "success",
        message: isEditing ? "Student updated successfully" : "Student registered successfully",
      })

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          gradeId,
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          dateOfBirth: "",
          enrollmentDate: new Date().toISOString().split("T")[0],
          parentName: "",
          parentPhone: "",
          address: "",
          status: "active",
          academicPerformance: "average",
        })
      }

      setTimeout(() => setSubmitMessage(null), 3000)
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: "An error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof Student, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const grade = GRADES.find((g) => g.id === gradeId)

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{isEditing ? "Edit Student" : "Register New Student"}</span>
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" size="sm" className="p-0">
              <X className="h-5 w-5" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Messages */}
        {submitMessage && (
          <Alert
            variant={submitMessage.type === "success" ? "default" : "destructive"}
            className={submitMessage.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}
          >
            <div className="flex items-center gap-2">
              {submitMessage.type === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={submitMessage.type === "success" ? "text-green-700" : "text-red-700"}>
                {submitMessage.message}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {/* Grade Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <span className="font-semibold">Grade:</span> {grade?.name} (Section {grade?.section}) - Teacher:{" "}
            {grade?.classTeacher}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="Enter phone number"
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  className={errors.dateOfBirth ? "border-red-500" : ""}
                />
                {errors.dateOfBirth && <p className="text-sm text-red-500">{errors.dateOfBirth}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate || ""}
                  onChange={(e) => handleInputChange("enrollmentDate", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Parent/Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name *</Label>
                <Input
                  id="parentName"
                  value={formData.parentName || ""}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  placeholder="Enter parent name"
                  className={errors.parentName ? "border-red-500" : ""}
                />
                {errors.parentName && <p className="text-sm text-red-500">{errors.parentName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone *</Label>
                <Input
                  id="parentPhone"
                  value={formData.parentPhone || ""}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="Enter parent phone"
                  className={errors.parentPhone ? "border-red-500" : ""}
                />
                {errors.parentPhone && <p className="text-sm text-red-500">{errors.parentPhone}</p>}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter address"
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || "active"}
                  onValueChange={(value) => handleInputChange("status", value as any)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="academicPerformance">Academic Performance</Label>
                <Select
                  value={formData.academicPerformance || "average"}
                  onValueChange={(value) => handleInputChange("academicPerformance", value as any)}
                >
                  <SelectTrigger>
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
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button type="submit" disabled={isSubmitting} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : isEditing ? "Update Student" : "Register Student"}
            </Button>

            {onCancel && (
              <Button type="button" onClick={onCancel} variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
