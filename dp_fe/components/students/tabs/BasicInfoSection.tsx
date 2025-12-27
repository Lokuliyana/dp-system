"use client";

import { useState } from "react";
import type { Student } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Save } from "lucide-react";

interface BasicInfoSectionProps {
  student: Student;
  onSave: (student: any) => void;
}

export function BasicInfoSection({ student, onSave }: BasicInfoSectionProps) {
  const [formData, setFormData] = useState<any>(student);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid max-w-5xl gap-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Full Name (En)">
              <Input
                value={formData.fullNameEn || ""}
                onChange={(e) => handleChange("fullNameEn", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Full Name (Si)">
              <Input
                value={formData.fullNameSi || ""}
                onChange={(e) => handleChange("fullNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Name with Initials (Si)">
              <Input
                value={formData.nameWithInitialsSi || ""}
                onChange={(e) => handleChange("nameWithInitialsSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="First Name (Si)">
              <Input
                value={formData.firstNameSi || ""}
                onChange={(e) => handleChange("firstNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Last Name (Si)">
              <Input
                value={formData.lastNameSi || ""}
                onChange={(e) => handleChange("lastNameSi", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Date of Birth">
              <Input
                type="date"
                value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ""}
                onChange={(e) => handleChange("dob", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Gender">
              <Select
                value={formData.sex}
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
                value={formData.admissionNumber || ""}
                onChange={(e) => handleChange("admissionNumber", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Admission Date">
              <Input
                type="date"
                value={formData.admissionDate ? new Date(formData.admissionDate).toISOString().split('T')[0] : ""}
                onChange={(e) => handleChange("admissionDate", e.target.value)}
                className="bg-white"
              />
            </Field>

             <Field label="Birth Certificate Number">
              <Input
                value={formData.birthCertificateNumber || ""}
                onChange={(e) => handleChange("birthCertificateNumber", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Medium">
              <Select
                value={formData.medium}
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
                value={formData.email || ""}
                onChange={(e) => handleChange("email", e.target.value)}
                className="bg-white"
              />
            </Field>

            <Field label="Address (Si)">
              <Input
                value={formData.addressSi || ""}
                onChange={(e) => handleChange("addressSi", e.target.value)}
                className="bg-white"
              />
            </Field>
             <Field label="Address (En)">
              <Input
                value={formData.addressEn || ""}
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
                  value={formData.fatherNameEn || ""}
                  onChange={(e) => handleChange("fatherNameEn", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={formData.fatherNumber || ""}
                  onChange={(e) => handleChange("fatherNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Occupation">
                <Input
                  value={formData.fatherOccupation || ""}
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
                  value={formData.motherNameEn || ""}
                  onChange={(e) => handleChange("motherNameEn", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={formData.motherNumber || ""}
                  onChange={(e) => handleChange("motherNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Occupation">
                <Input
                  value={formData.motherOccupation || ""}
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
                  value={formData.emergencyNumber || ""}
                  onChange={(e) => handleChange("emergencyNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
              <Field label="Whatsapp Number">
                <Input
                  value={formData.whatsappNumber || ""}
                  onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                  className="bg-white"
                />
              </Field>
            </div>
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
