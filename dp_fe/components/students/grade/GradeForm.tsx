"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateGradePayload } from "@/services/masterdata/grades.service";
import { useTeachers } from "@/hooks/useTeachers";

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
              <Select
                onValueChange={(val) => field.onChange(val === "unassigned" ? null : val)}
                defaultValue={field.value || undefined}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.firstNameEn} {teacher.lastNameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
