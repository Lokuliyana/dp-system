"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { Student } from "@/types/models";

const studentSchema = z.object({
  firstNameSi: z.string().optional(),
  lastNameSi: z.string().optional(),
  firstNameEn: z.string().min(1, "First Name (English) is required"),
  lastNameEn: z.string().min(1, "Last Name (English) is required"),
  admissionNumber: z.string().min(1, "Admission Number is required"),
  admissionDate: z.date({ required_error: "Admission Date is required" }),
  dob: z.date({ required_error: "Date of Birth is required" }),
  gradeId: z.string().min(1, "Grade is required"),
  sectionId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phoneNum: z.string().optional(),
  addressSi: z.string().optional(),
  addressEn: z.string().optional(),
  academicYear: z.number().min(2000, "Invalid Year"),
  emergencyContacts: z.array(
    z.object({
      nameSi: z.string().optional(),
      nameEn: z.string().optional(),
      relationshipSi: z.string().optional(),
      relationshipEn: z.string().optional(),
      number: z.string().optional(),
    })
  ).optional(),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Partial<Student>;
  grades: { id: string; name: string }[];
  sections: { id: string; name: string }[];
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export function StudentForm({
  initialData,
  grades,
  sections,
  onSubmit,
  isLoading,
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstNameSi: initialData?.firstNameSi || "",
      lastNameSi: initialData?.lastNameSi || "",
      firstNameEn: initialData?.firstNameEn || "",
      lastNameEn: initialData?.lastNameEn || "",
      admissionNumber: initialData?.admissionNumber || "",
      admissionDate: initialData?.admissionDate ? new Date(initialData.admissionDate) : new Date(),
      dob: initialData?.dob ? new Date(initialData.dob) : undefined,
      gradeId: initialData?.gradeId || "",
      sectionId: initialData?.sectionId || "",
      email: initialData?.email || "",
      phoneNum: initialData?.phoneNum || "",
      addressSi: initialData?.addressSi || "",
      addressEn: initialData?.addressEn || "",
      academicYear: initialData?.academicYear || new Date().getFullYear(),
      emergencyContacts: initialData?.emergencyContacts || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "emergencyContacts",
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        firstNameSi: initialData.firstNameSi || "",
        lastNameSi: initialData.lastNameSi || "",
        firstNameEn: initialData.firstNameEn || "",
        lastNameEn: initialData.lastNameEn || "",
        admissionNumber: initialData.admissionNumber || "",
        admissionDate: initialData.admissionDate ? new Date(initialData.admissionDate) : new Date(),
        dob: initialData.dob ? new Date(initialData.dob) : undefined,
        gradeId: initialData.gradeId || "",
        sectionId: initialData.sectionId || "",
        email: initialData.email || "",
        phoneNum: initialData.phoneNum || "",
        addressSi: initialData.addressSi || "",
        addressEn: initialData.addressEn || "",
        academicYear: initialData.academicYear || new Date().getFullYear(),
        emergencyContacts: initialData.emergencyContacts || [],
      });
    } else {
      // Reset to empty state if initialData is undefined (switching to create mode)
       form.reset({
        firstNameSi: "",
        lastNameSi: "",
        firstNameEn: "",
        lastNameEn: "",
        admissionNumber: "",
        admissionDate: new Date(),
        dob: undefined,
        gradeId: "",
        sectionId: "",
        email: "",
        phoneNum: "",
        addressSi: "",
        addressEn: "",
        academicYear: new Date().getFullYear(),
        emergencyContacts: [],
      });
    }
  }, [initialData, form]);

  const handleSubmit = (values: StudentFormValues) => {
    // Convert dates to ISO strings for API
    const payload = {
      ...values,
      admissionDate: values.admissionDate.toISOString(),
      dob: values.dob?.toISOString(),
      sectionId: values.sectionId || undefined,
      email: values.email || undefined,
    };
    onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Names */}
          <FormField
            control={form.control}
            name="firstNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (English) *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastNameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (English) *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstNameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="සමන්" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastNameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="පෙරේරා" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Admission & Personal */}
          <FormField
            control={form.control}
            name="admissionNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Number *</FormLabel>
                <FormControl>
                  <Input placeholder="AD-1234" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="admissionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Admission Date *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth *</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                    onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Academic */}
          <FormField
            control={form.control}
            name="gradeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade.id} value={grade.id}>
                        {grade.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sectionId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a section" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="student@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNum"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="0771234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressEn"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address (English)</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Colombo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="addressSi"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="123 ප්‍රධාන පාර, කොළඹ" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Emergency Contacts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Emergency Contacts</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ nameEn: "", number: "" })}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 gap-4 md:grid-cols-3 items-end border p-4 rounded-md">
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.nameEn`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.relationshipEn`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`emergencyContacts.${index}.number`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
