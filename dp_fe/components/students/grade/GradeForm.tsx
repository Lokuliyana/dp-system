"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { CreateGradePayload } from "@/services/masterdata/grades.service";
import { useTeachers } from "@/hooks/useTeachers";
import { LiveSearch } from "@/components/reusable";

const gradeSchema = z.object({
  nameSi: z.string().min(1, "Sinhala name is required"),
  nameEn: z.string().min(1, "English name is required"),
  level: z.number().min(1, "Grade level is required"),
  classTeacherId: z.string().optional().nullable(),
});

interface GradeFormProps {
  defaultValues?: Partial<CreateGradePayload>;
  onSubmit: (data: CreateGradePayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function GradeForm({ defaultValues, onSubmit, isLoading, onCancel }: GradeFormProps) {
  const { data: teachers = [] } = useTeachers();
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

  const form = useForm<CreateGradePayload>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      nameSi: "",
      nameEn: "",
      level: undefined,
      classTeacherId: null,
      ...defaultValues,
    },
  });

  const searchableTeachers = useMemo(() => {
    return teachers.map((t: any) => ({
      ...t,
      displayName: `${t.firstNameEn} ${t.lastNameEn}`,
    }));
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearchTerm.trim().toLowerCase();
    if (!q) return searchableTeachers;
    return searchableTeachers.filter((t: any) =>
      t.displayName.toLowerCase().includes(q)
    );
  }, [searchableTeachers, teacherSearchTerm]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nameSi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Name (Sinhala)</FormLabel>
              <FormControl>
                <Input placeholder="Grade Name (Sinhala)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nameEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Name (English)</FormLabel>
              <FormControl>
                <Input placeholder="Grade Name (English)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="level"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Level (Number)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="e.g. 1" 
                  {...field} 
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? undefined : parseInt(val, 10));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="classTeacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade Head / Teacher in Charge</FormLabel>
              <FormControl>
                <LiveSearch
                  data={filteredTeachers}
                  labelKey="displayName"
                  valueKey="id"
                  onSearch={setTeacherSearchTerm}
                  selected={(val) => field.onChange(val.item?.id || null)}
                  defaultSelected={field.value || undefined}
                  placeholder="Search teacher..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Grade"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
