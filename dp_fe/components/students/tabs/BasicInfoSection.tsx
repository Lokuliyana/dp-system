"use client";

import { useState } from "react";
import type { Student } from "@/lib/school-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Save } from "lucide-react";

interface BasicInfoSectionProps {
  student: Student;
  onSave: (student: Student) => void;
}

export function BasicInfoSection({ student, onSave }: BasicInfoSectionProps) {
  const [formData, setFormData] = useState<Student>(student);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // here you can later plug an async call if needed
      onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid max-w-5xl gap-6">
      {/* Personal */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="First Name">
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Last Name">
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Phone">
              <Input
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Date of Birth">
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Address">
              <Input
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="bg-white"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Academic */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Field label="Status">
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as Student["status"])}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Academic Performance">
              <Select
                value={formData.academicPerformance}
                onValueChange={(value) =>
                  handleChange("academicPerformance", value as Student["academicPerformance"])
                }
              >
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Roll Number">
              <Input
                type="number"
                value={formData.rollNumber}
                onChange={(e) =>
                  handleChange("rollNumber", Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value))
                }
                className="bg-white"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Parent */}
      <Card>
        <CardHeader>
          <CardTitle>Parent / Guardian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Parent Name">
              <Input
                value={formData.parentName}
                onChange={(e) => handleChange("parentName", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Parent Phone">
              <Input
                value={formData.parentPhone}
                onChange={(e) => handleChange("parentPhone", e.target.value)}
                className="bg-white"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full gap-2 bg-green-600 hover:bg-green-700 md:w-auto"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
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
