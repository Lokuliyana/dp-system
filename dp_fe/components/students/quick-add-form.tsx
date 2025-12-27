"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Save, UserPlus, ArrowRight, Keyboard, CheckCircle2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const quickStudentSchema = z.object({
  firstNameSi: z.string().min(1, "First Name (Sinhala) is required"),
  lastNameSi: z.string().min(1, "Last Name (Sinhala) is required"),
  fullNameSi: z.string().min(1, "Full Name (Sinhala) is required"),
  nameWithInitialsSi: z.string().min(1, "Name with Initials (Sinhala) is required"),
  
  fullNameEn: z.string().min(1, "Full Name (English) is required"),
  firstNameEn: z.string().optional(),
  lastNameEn: z.string().optional(),
  
  admissionNumber: z.string().min(1, "Admission Number is required"),
  dob: z.date({ required_error: "Date of Birth is required" }),
  sex: z.enum(["male", "female"], { required_error: "Sex is required" }),
  
  gradeId: z.string().min(1, "Grade is required"),
  sectionId: z.string().min(1, "Section is required"),
  academicYear: z.number().min(2000),
});

type QuickStudentValues = z.infer<typeof quickStudentSchema>;

interface QuickAddStudentFormProps {
  grades: { id: string; name: string }[];
  sections: { id: string; name: string; assignedGradeIds?: string[] }[];
  onSubmit: (data: QuickStudentValues) => Promise<void>;
  defaultGradeId?: string;
  defaultSectionId?: string;
}

export function QuickAddStudentForm({
  grades,
  sections,
  onSubmit,
  defaultGradeId,
  defaultSectionId,
}: QuickAddStudentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addedCount, setAddedCount] = useState(0);
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const admissionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstNameRef.current?.focus();
  }, []);

  const form = useForm<QuickStudentValues>({
    resolver: zodResolver(quickStudentSchema),
    defaultValues: {
      firstNameSi: "",
      lastNameSi: "",
      fullNameSi: "",
      nameWithInitialsSi: "",
      fullNameEn: "",
      firstNameEn: "",
      lastNameEn: "",
      admissionNumber: "",
      dob: undefined,
      sex: "male",
      gradeId: defaultGradeId || "",
      sectionId: defaultSectionId || "",
      academicYear: new Date().getFullYear(),
    },
  });

  const selectedGradeId = form.watch("gradeId");
  const filteredSections = sections.filter(s => 
    !selectedGradeId || !s.assignedGradeIds || s.assignedGradeIds.includes(selectedGradeId)
  );

  const handleFormSubmit = async (values: QuickStudentValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      setAddedCount(prev => prev + 1);
      setLastAdded(`${values.fullNameEn} (${values.admissionNumber})`);
      
      // Reset only name and admission number, keep grade/section/year
      form.reset({
        ...values,
        firstNameSi: "",
        lastNameSi: "",
        fullNameSi: "",
        nameWithInitialsSi: "",
        fullNameEn: "",
        firstNameEn: "",
        lastNameEn: "",
        admissionNumber: "",
        dob: undefined,
        sex: "male",
      });
      
      // Focus back to first name for next entry
      setTimeout(() => {
        firstNameRef.current?.focus();
      }, 0);
      
      toast({
        title: "Student added",
        description: `${values.fullNameEn} has been registered.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student. Please check the details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, fieldName: keyof QuickStudentValues) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (fieldName === "firstNameEn") {
        lastNameRef.current?.focus();
      } else if (fieldName === "lastNameEn") {
        admissionRef.current?.focus();
      } else if (fieldName === "admissionNumber") {
        form.handleSubmit(handleFormSubmit)();
      }
    }
  };

  return (
    <Card className="border-2 border-primary/10 shadow-xl">
      <CardHeader className="bg-primary/5 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserPlus className="h-6 w-6 text-primary" />
              Quick Student Entry
            </CardTitle>
            <CardDescription>
              Optimized for rapid bulk registration. Use <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">Tab</kbd> to navigate and <kbd className="px-1.5 py-0.5 rounded border bg-background text-xs font-mono">Enter</kbd> to save.
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
              {addedCount} Students Added
            </Badge>
            {lastAdded && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                Last: {lastAdded}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(handleFormSubmit)} 
            className="space-y-8"
            onKeyDown={handleKeyDown}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="gradeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Grade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {grades.map((g) => (
                          <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
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
                    <FormLabel className="text-sm font-semibold">Section</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select Section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredSections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Academic Year</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        className="h-12 border-2 focus:ring-primary/20 font-medium"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-dashed">
              {/* Row 1: Personal */}
              <FormField
                control={form.control}
                name="admissionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Admission Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 2024/001" 
                        className="h-12 border-2 focus:ring-primary/20 text-lg font-mono"
                        {...field} 
                        ref={(e) => {
                          field.ref(e);
                          // @ts-ignore
                          admissionRef.current = e;
                        }}
                        onKeyDown={(e) => handleKeyDown(e, "admissionNumber")}
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
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="h-12 border-2 focus:ring-primary/20"
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
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Sex</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 border-2 focus:ring-primary/20">
                          <SelectValue placeholder="Select Sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 2: Sinhala Names */}
              <FormField
                control={form.control}
                name="firstNameSi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">First Name (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="සමන්" className="h-12 border-2 focus:ring-primary/20" {...field} />
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
                    <FormLabel className="text-sm font-semibold">Last Name (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="පෙරේරා" className="h-12 border-2 focus:ring-primary/20" {...field} />
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
                    <FormLabel className="text-sm font-semibold">Name with Initials (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="එස්. පෙරේරා" className="h-12 border-2 focus:ring-primary/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullNameSi"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel className="text-sm font-semibold">Full Name (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="සමන් පෙරේරා" className="h-12 border-2 focus:ring-primary/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Row 3: English Names */}
              <FormField
                control={form.control}
                name="firstNameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">First Name (English)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John" 
                        className="h-12 border-2 focus:ring-primary/20"
                        {...field} 
                        ref={(e) => {
                          field.ref(e);
                          // @ts-ignore
                          firstNameRef.current = e;
                        }}
                        onKeyDown={(e) => handleKeyDown(e, "firstNameEn")}
                      />
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
                    <FormLabel className="text-sm font-semibold">Last Name (English)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Doe" 
                        className="h-12 border-2 focus:ring-primary/20"
                        {...field} 
                        ref={(e) => {
                          field.ref(e);
                          // @ts-ignore
                          lastNameRef.current = e;
                        }}
                        onKeyDown={(e) => handleKeyDown(e, "lastNameEn")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fullNameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold">Full Name (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" className="h-12 border-2 focus:ring-primary/20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                <span>Tip: Press <strong>Enter</strong> in any field to save and continue</span>
              </div>
              <Button 
                type="submit" 
                size="lg" 
                className="h-14 px-10 gap-2 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save & Next Student"}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
