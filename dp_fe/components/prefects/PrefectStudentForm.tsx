"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AddPrefectStudentPayload } from "@/services/masterdata/prefects.service";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { usePrefectPositions } from "@/hooks/usePrefectPositions";
import { LiveSearch } from "@/components/reusable";

const addStudentSchema = z.object({
  gradeId: z.string().optional(),
  studentId: z.string().optional(),
  rank: z.enum([
    "head-prefect",
    "deputy-head-prefect",
    "senior-prefect",
    "junior-prefect",
    "primary-prefect",
  ]),
  positionIds: z.array(z.string()).optional(),
});

interface PrefectStudentFormProps {
  onSubmit: (data: AddPrefectStudentPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
  defaultValues?: Partial<AddPrefectStudentPayload> & { gradeId?: string };
  mode?: "add" | "edit";
}

export function PrefectStudentForm({ onSubmit, isLoading, onCancel, defaultValues, mode = "add" }: PrefectStudentFormProps) {
  const { data: grades = [] } = useGrades();
  const { data: positions = [] } = usePrefectPositions();
  
  const form = useForm<z.infer<typeof addStudentSchema>>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      gradeId: defaultValues?.gradeId || "",
      studentId: defaultValues?.studentId || "",
      rank: (defaultValues?.rank as any) || "prefect",
      positionIds: defaultValues?.positionIds || [],
    },
  });

  const selectedGradeId = form.watch("gradeId");
  const { data: students = [] } = useStudentsByGrade(selectedGradeId || "");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  const searchableStudents = useMemo(() => {
    return students.map((s: any) => ({
      ...s,
      _id: s._id || s.id,
      displayName: `${s.nameWithInitialsSi || s.fullNameSi || ''} (${s.admissionNumber || ''})`,
    }));
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = studentSearchTerm.trim().toLowerCase();
    if (!q) return searchableStudents;
    return searchableStudents.filter((s: any) => 
      s.displayName.toLowerCase().includes(q) ||
      (s.firstNameSi || "").toLowerCase().includes(q) ||
      (s.lastNameSi || "").toLowerCase().includes(q)
    );
  }, [searchableStudents, studentSearchTerm]);

  const handleSubmit = (values: z.infer<typeof addStudentSchema>) => {
    if (mode === "add" && !values.gradeId) {
      return;
    }
    if (mode === "add" && !values.studentId) {
      return;
    }
    const student = mode === "add" ? students.find(s => s.id === values.studentId) : undefined;
    onSubmit({
      studentId: values.studentId || (defaultValues?.studentId as string),
      rank: values.rank,
      positionIds: values.positionIds,
      studentNameSi: student ? `${student.nameWithInitialsSi || student.fullNameSi || ''} (${student.admissionNumber || ''})` : undefined,
      studentNameEn: student ? `${student.firstNameEn} ${student.lastNameEn} (${student.admissionNumber || ''})` : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {mode === "add" && (
          <>
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Grade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.id}>
                          {grade.nameSi}
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
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Student</FormLabel>
                  <FormControl>
                    <LiveSearch
                      data={filteredStudents}
                      labelKey="displayName"
                      valueKey="_id"
                      onSearch={setStudentSearchTerm}
                      selected={(val) => field.onChange(val.item?._id || val.item?.id)}
                      defaultSelected={field.value}
                      disabled={!selectedGradeId}
                      placeholder={selectedGradeId ? "Select Student" : "Select grade first"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rank</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Rank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="head-prefect">Head Prefect (ප්‍රධාන ශිෂ්‍ය නායක)</SelectItem>
                  <SelectItem value="deputy-head-prefect">Deputy Head Prefect (උප ප්‍රධාන ශිෂ්‍ය නායක)</SelectItem>
                  <SelectItem value="senior-prefect">Senior Prefect (ජ්‍යෙෂ්ඨ ශිෂ්‍ය නායක)</SelectItem>
                  <SelectItem value="junior-prefect">Junior Prefect (කනිෂ්ඨ ශිෂ්‍ය නායක)</SelectItem>
                  <SelectItem value="primary-prefect">Primary Prefect (ප්‍රාථමික ශිෂ්‍ය නායක)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="positionIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Positions / Duties</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border p-2 rounded-md">
                {positions.map((pos) => {
                  const posId = pos.id || (pos as any)._id;
                  return (
                    <FormField
                      key={posId}
                      control={form.control}
                      name="positionIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={posId}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(posId)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), posId])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== posId
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {pos.nameEn}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Student"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
