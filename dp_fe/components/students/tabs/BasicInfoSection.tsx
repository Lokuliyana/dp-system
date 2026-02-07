"use client";

import { useState } from "react";
import type { Student } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Save, UserCheck, UserX } from "lucide-react";
import { StudentAvatar } from "@/components/students/student-avatar";
import { Badge } from "@/components/ui/badge";
import { StudentStatusDialog } from "@/components/students/student-status-dialog";

interface BasicInfoSectionProps {
  student: Student;
  onSave?: (student: any) => void;
  onChange?: (updated: Partial<Student>) => void;
}

export function BasicInfoSection({ student, onSave, onChange }: BasicInfoSectionProps) {
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleChange = (field: string, value: any) => {
    if (onChange) {
      onChange({ [field]: value });
    }
  };

  const handleStatusUpdate = (note: string) => {
    const targetStatus = student.status === "inactive" ? "active" : "inactive";
    if (onChange) {
      onChange({ 
        status: targetStatus,
        [targetStatus === "active" ? "activeNote" : "inactiveNote"]: note
      });
    }
    setIsStatusDialogOpen(false);
    // Trigger save immediately for status change if desired, 
    // or let the user click the global save button.
    // Given the previous implementation, let's call onSave if it exists.
    if (onSave) {
      // We need to pass the updated object. 
      // Since onChange just happened, the parent state might not have updated yet if it's async.
      // But in this page, onChange updates the formData in the parent.
    }
  };


  return (
    <div className="grid max-w-5xl gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Personal Information</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={student.status === "inactive" ? "destructive" : "default"}
              className={`px-3 py-1 capitalize ${student.status !== "inactive" ? "bg-green-600 hover:bg-green-700" : ""}`}
            >
              {student.status || "active"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStatusDialogOpen(true)}
              className="flex items-center gap-2"
            >
              {student.status === "inactive" ? (
                <>
                  <UserCheck className="h-4 w-4 text-green-500" />
                  Make Active
                </>
              ) : (
                <>
                  <UserX className="h-4 w-4 text-red-500" />
                  Make Inactive
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full Name (En)">
              <Input
                value={student.fullNameEn || ""}
                onChange={(e) => handleChange("fullNameEn", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Full Name (Si)">
              <Input
                value={student.fullNameSi || ""}
                onChange={(e) => handleChange("fullNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Name with Initials (Si)">
              <Input
                value={student.nameWithInitialsSi || ""}
                onChange={(e) => handleChange("nameWithInitialsSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="First Name (Si)">
              <Input
                value={student.firstNameSi || ""}
                onChange={(e) => handleChange("firstNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Last Name (Si)">
              <Input
                value={student.lastNameSi || ""}
                onChange={(e) => handleChange("lastNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Date of Birth">
              <Input
                type="date"
                value={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ""}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Gender">
              <Select
                value={student.sex}
                onValueChange={(value) => handleChange("sex", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Admission Number">
              <Input
                value={student.admissionNumber || ""}
                onChange={(e) => handleChange("admissionNumber", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Admission Date">
              <Input
                type="date"
                value={student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : ""}
                onChange={(e) => handleChange("admissionDate", e.target.value)}
                className="bg-white"
              />
            </Field>

             <Field label="Birth Certificate Number">
              <Input
                value={student.birthCertificateNumber || ""}
                onChange={(e) => handleChange("birthCertificateNumber", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Medium">
              <Select
                value={student.medium}
                onValueChange={(value) => handleChange("medium", value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Medium" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sinhala">Sinhala</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={student.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Address (Si)">
              <Input
                value={student.addressSi || ""}
                onChange={(e) => handleChange("addressSi", e.target.value)}
                className="bg-white"
              />
            </Field>
            <Field label="Address (En)">
              <Input
                value={student.addressEn || ""}
                onChange={(e) => handleChange("addressEn", e.target.value)}
                className="bg-white"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Guardian Details */}
      <Card>
        <CardHeader>
          <CardTitle>Guardian Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Father */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Father&apos;s Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name (En)">
                <Input
                  value={student.fatherNameEn || ""}
                  onChange={(e) => handleChange("fatherNameEn", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={student.fatherNumber || ""}
                  onChange={(e) => handleChange("fatherNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Occupation">
                <Input
                  value={student.fatherOccupation || ""}
                  onChange={(e) => handleChange("fatherOccupation", e.target.value)}
                  className="bg-white"
                />
              </Field>
            </div>
          </div>

          {/* Mother */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Mother&apos;s Details</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Name (En)">
                <Input
                  value={student.motherNameEn || ""}
                  onChange={(e) => handleChange("motherNameEn", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={student.motherNumber || ""}
                  onChange={(e) => handleChange("motherNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Occupation">
                <Input
                  value={student.motherOccupation || ""}
                  onChange={(e) => handleChange("motherOccupation", e.target.value)}
                  className="bg-white"
                />
              </Field>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 border-b pb-2">Emergency Contact</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Emergency Number">
                <Input
                  value={student.emergencyNumber || ""}
                  onChange={(e) => handleChange("emergencyNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Whatsapp Number">
                <Input
                  value={student.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status History / Notes */}
      {(student.activeNote || student.inactiveNote) && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.activeNote && (
              <div className="p-3 bg-green-50 border border-green-100 rounded-md">
                <p className="text-xs font-semibold text-green-700 uppercase mb-1">Latest Activation Note</p>
                <p className="text-sm text-slate-700 italic">"{student.activeNote}"</p>
              </div>
            )}
            {student.inactiveNote && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-xs font-semibold text-red-700 uppercase mb-1">Latest Deactivation Note</p>
                <p className="text-sm text-slate-700 italic">"{student.inactiveNote}"</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No internal save button - using header save */}
      
      <StudentStatusDialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        onConfirm={handleStatusUpdate}
        targetStatus={student.status === "inactive" ? "active" : "inactive"}
      />
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
