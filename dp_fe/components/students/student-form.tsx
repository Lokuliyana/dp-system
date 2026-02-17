"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Plus, Trash2, Users } from "lucide-react";
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
  // --- Names ---
  firstNameSi: z.string().min(1, "First Name (Sinhala) is required"),
  lastNameSi: z.string().min(1, "Last Name (Sinhala) is required"),
  fullNameSi: z.string().min(1, "Full Name (Sinhala) is required"),
  nameWithInitialsSi: z.string().min(1, "Name with Initials (Sinhala) is required"),
  
  firstNameEn: z.string().optional(),
  lastNameEn: z.string().optional(),
  fullNameEn: z.string().min(1, "Full Name (English) is required"),

  // --- Personal ---
  admissionNumber: z.string().min(1, "Admission Number is required"),
  admissionDate: z.date({ required_error: "Admission Date is required" }),
  dob: z.date({ required_error: "Date of Birth is required" }),
  sex: z.enum(["male", "female"], { required_error: "Sex is required" }),
  birthCertificateNumber: z.string().optional(),

  // --- Academic ---
  gradeId: z.string().optional(),
  sectionId: z.string().optional(),
  admittedGrade: z.string().optional(),
  medium: z.enum(["sinhala", "english", "tamil"]).optional(),
  academicYear: z.number().min(2000, "Invalid Year"),
  admissionYear: z.number().min(1900, "Invalid Year").optional(),

  // --- Contact ---
  email: z.string().email().optional().or(z.literal("")),
  phoneNum: z.string().optional(),
  whatsappNumber: z.string().optional(),
  emergencyNumber: z.string().optional(),
  addressSi: z.string().optional(),
  addressEn: z.string().optional(),

  // --- Parents ---
  motherNameEn: z.string().optional(),
  motherNumber: z.string().optional(),
  motherOccupation: z.string().optional(),

  fatherNameEn: z.string().optional(),
  fatherNumber: z.string().optional(),
  fatherOccupation: z.string().optional(),
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
  const firstInputRef = useState<HTMLInputElement | null>(null);
  
  // Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.querySelector('input[name="firstNameSi"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl + Enter -> Submit
        e.preventDefault();
        form.handleSubmit(handleSubmit)();
      } else {
        // Enter -> Next field
        e.preventDefault();
        const formEl = e.currentTarget as HTMLFormElement;
        const elements = Array.from(formEl.elements) as HTMLElement[];
        const index = elements.indexOf(e.target as HTMLElement);
        
        if (index > -1 && index < elements.length - 1) {
          // Find next focusable element (skip hidden, disabled, etc if needed)
          let nextIndex = index + 1;
          while (nextIndex < elements.length) {
            const next = elements[nextIndex];
            if (next.tagName === 'INPUT' || next.tagName === 'SELECT' || next.tagName === 'TEXTAREA' || next.tagName === 'BUTTON') {
              if (!next.hasAttribute('disabled') && !next.hasAttribute('hidden')) {
                next.focus();
                break;
              }
            }
            nextIndex++;
          }
        }
      }
    }
  };
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstNameSi: initialData?.firstNameSi || "",
      lastNameSi: initialData?.lastNameSi || "",
      nameWithInitialsSi: initialData?.nameWithInitialsSi || "",
      fullNameSi: initialData?.fullNameSi || "",
      
      firstNameEn: initialData?.firstNameEn || "",
      lastNameEn: initialData?.lastNameEn || "",
      fullNameEn: initialData?.fullNameEn || "",

      admissionNumber: initialData?.admissionNumber || "",
      admissionDate: initialData?.admissionDate ? new Date(initialData.admissionDate) : undefined,
      dob: initialData?.dob ? new Date(initialData.dob) : undefined,
      sex: (initialData?.sex as "male" | "female") || undefined,
      birthCertificateNumber: initialData?.birthCertificateNumber || "",

      gradeId: (initialData?.gradeId && typeof initialData?.gradeId === 'object' ? (initialData.gradeId as any)._id : initialData?.gradeId) || "",
      sectionId: initialData?.sectionId || "",
      admittedGrade: initialData?.admittedGrade || "",
      medium: (initialData?.medium as "sinhala" | "english" | "tamil") || "sinhala",
      academicYear: initialData?.academicYear || new Date().getFullYear(),
      admissionYear: initialData?.admissionYear || (initialData?.admissionDate ? new Date(initialData.admissionDate).getFullYear() : undefined),

      addressSi: initialData?.addressSi || "",
      addressEn: initialData?.addressEn || "",
      phoneNum: initialData?.phoneNum || "",
      whatsappNumber: initialData?.whatsappNumber || "",
      emergencyNumber: initialData?.emergencyNumber || "",
      email: initialData?.email || "",

      motherNameEn: initialData?.motherNameEn || "",
      motherNumber: initialData?.motherNumber || "",
      motherOccupation: initialData?.motherOccupation || "",

      fatherNameEn: initialData?.fatherNameEn || "",
      fatherNumber: initialData?.fatherNumber || "",
      fatherOccupation: initialData?.fatherOccupation || "",
    },
  });

  // Reset form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        firstNameSi: initialData.firstNameSi || "",
        lastNameSi: initialData.lastNameSi || "",
        fullNameSi: initialData.fullNameSi || "",
        nameWithInitialsSi: initialData.nameWithInitialsSi || "",
        firstNameEn: initialData.firstNameEn || "",
        lastNameEn: initialData.lastNameEn || "",
        fullNameEn: initialData.fullNameEn || "",
        
        admissionNumber: initialData.admissionNumber || "",
        admissionDate: initialData.admissionDate ? new Date(initialData.admissionDate) : undefined,
        dob: initialData.dob ? new Date(initialData.dob) : undefined,
        sex: (initialData.sex as "male" | "female") || undefined,
        birthCertificateNumber: initialData.birthCertificateNumber || "",
        
        gradeId: (initialData.gradeId && typeof initialData.gradeId === 'object' ? (initialData.gradeId as any)._id : initialData.gradeId) || "",
        sectionId: initialData.sectionId || "",
        admittedGrade: initialData.admittedGrade || "",
        medium: (initialData.medium as "sinhala" | "english" | "tamil") || "sinhala",
        academicYear: initialData.academicYear || new Date().getFullYear(),
        
        email: initialData.email || "",
        phoneNum: initialData.phoneNum || "",
        whatsappNumber: initialData.whatsappNumber || "",
        emergencyNumber: initialData.emergencyNumber || "",
        addressSi: initialData.addressSi || "",
        addressEn: initialData.addressEn || "",
        
        motherNameEn: initialData.motherNameEn || "",
        motherNumber: initialData.motherNumber || "",
        motherOccupation: initialData.motherOccupation || "",
        fatherNameEn: initialData.fatherNameEn || "",
        fatherNumber: initialData.fatherNumber || "",
        fatherOccupation: initialData.fatherOccupation || "",
      });
    } else {
      // Reset to empty state if initialData is undefined (switching to create mode)
       form.reset({
        firstNameSi: "",
        lastNameSi: "",
        fullNameSi: "",
        nameWithInitialsSi: "",
        firstNameEn: "",
        lastNameEn: "",
        fullNameEn: "",
        
        admissionNumber: "",
        admissionDate: new Date(),
        dob: undefined,
        sex: "male",
        birthCertificateNumber: "",
        
        gradeId: "",
        sectionId: "",
        admittedGrade: "",
        medium: "sinhala",
        academicYear: new Date().getFullYear(),
        
        email: "",
        phoneNum: "",
        whatsappNumber: "",
        emergencyNumber: "",
        addressSi: "",
        addressEn: "",
        
        motherNameEn: "",
        motherNumber: "",
        motherOccupation: "",
        fatherNameEn: "",
        fatherNumber: "",
        fatherOccupation: "",
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
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        onKeyDown={handleKeyDown}
        className="space-y-8"
      >
        <div className="space-y-8">
          {/* Names Section */}
          <section className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6 text-blue-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Student Identification</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FormField
                control={form.control}
                name="admissionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Admission Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="AD-1234" {...field} className="focus-visible:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameWithInitialsSi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Name with Initials (Sinhala) *</FormLabel>
                    <FormControl>
                      <Input placeholder="එස්. පෙරේරා" {...field} className="focus-visible:ring-blue-500" />
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
                    <FormLabel className="text-slate-700 font-medium">First Name (Sinhala) *</FormLabel>
                    <FormControl>
                      <Input placeholder="සමන්" {...field} className="focus-visible:ring-blue-500" />
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
                    <FormLabel className="text-slate-700 font-medium">Last Name (Sinhala) *</FormLabel>
                    <FormControl>
                      <Input placeholder="පෙරේරා" {...field} className="focus-visible:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullNameSi"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-slate-700 font-medium">Full Name (Sinhala) *</FormLabel>
                    <FormControl>
                      <Input placeholder="සමන් පෙරේරා" {...field} className="focus-visible:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullNameEn"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-slate-700 font-medium">Full Name (English) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Saman Perera" {...field} className="focus-visible:ring-blue-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Academic & Personal Section */}
          <section className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6 text-emerald-700">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Academic & Personal Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-slate-700 font-medium">Date of Birth *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        className="focus-visible:ring-emerald-500"
                      />
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
                    <FormLabel className="text-slate-700 font-medium">Admission Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        value={field.value ? format(field.value, "yyyy-MM-dd") : ""}
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        className="focus-visible:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="admissionYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Admission Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={new Date().getFullYear().toString()} 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                        className="focus-visible:ring-emerald-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Sex *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-emerald-500">
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male (පුරුෂ)</SelectItem>
                        <SelectItem value="female">Female (ස්ත්‍රී)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Assigned Grade</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-emerald-500">
                          <SelectValue placeholder="Select grade" />
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
                name="admittedGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Admitted Grade (Record)</FormLabel>
                    <FormControl>
                      <Input placeholder="Grade 1" {...field} className="focus-visible:ring-emerald-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Medium</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-emerald-500">
                          <SelectValue placeholder="Select medium" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sinhala">Sinhala (සිංහල)</SelectItem>
                        <SelectItem value="english">English (ඉංග්‍රීසි)</SelectItem>
                        <SelectItem value="tamil">Tamil (දෙමළ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Contact Details Section */}
          <section className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6 text-amber-700">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Contact Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="addressSi"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel className="text-slate-700 font-medium">Address (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="ලිපිනය" {...field} className="focus-visible:ring-amber-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="077..." {...field} className="focus-visible:ring-amber-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Emergency Number</FormLabel>
                    <FormControl>
                      <Input placeholder="077..." {...field} className="focus-visible:ring-amber-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} className="focus-visible:ring-amber-500" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          {/* Parent Details Section */}
          <section className="p-6 bg-slate-50/50 rounded-xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-2 mb-6 text-purple-700">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Parent / Guardian Details</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mother */}
              <div className="space-y-5 p-5 bg-white/50 rounded-lg border border-purple-100/50 group hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
                  <span className="w-2 h-2 rounded-full bg-pink-400" />
                  <h4 className="font-semibold text-slate-800">Mother&apos;s Information</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="motherNameEn"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-600 text-sm">Full Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 text-sm">Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motherOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 text-sm">Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Father */}
              <div className="space-y-5 p-5 bg-white/50 rounded-lg border border-purple-100/50 group hover:border-purple-200 transition-colors">
                <div className="flex items-center gap-2 pb-2 border-b border-purple-50">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="font-semibold text-slate-800">Father&apos;s Information</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fatherNameEn"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-600 text-sm">Full Name (English)</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 text-sm">Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherOccupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-600 text-sm">Occupation</FormLabel>
                        <FormControl>
                          <Input {...field} className="focus-visible:ring-purple-400" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </section>
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
