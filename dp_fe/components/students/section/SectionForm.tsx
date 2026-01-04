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
import { Checkbox } from "@/components/ui/checkbox";
import { CreateSectionPayload } from "@/services/masterdata/sections.service";
import { Grade } from "@/types/models";

const sectionSchema = z.object({
  nameSi: z.string().min(1, "Sinhala name is required"),
  nameEn: z.string().min(1, "English name is required"),
  assignedGradeIds: z.array(z.string()).default([]),
});

interface SectionFormProps {
  grades: Grade[];
  defaultValues?: Partial<CreateSectionPayload>;
  onSubmit: (data: CreateSectionPayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function SectionForm({ grades, defaultValues, onSubmit, isLoading, onCancel }: SectionFormProps) {
  const form = useForm<CreateSectionPayload>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      nameSi: "",
      nameEn: "",
      assignedGradeIds: [],
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
              <FormLabel>Section Name (Sinhala)</FormLabel>
              <FormControl>
                <Input placeholder="Section Name (Sinhala)" {...field} />
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
              <FormLabel>Section Name (English)</FormLabel>
              <FormControl>
                <Input placeholder="Section Name (English)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assignedGradeIds"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Assigned Grades</FormLabel>
              </div>
              <div className="grid grid-cols-2 gap-4 border rounded-md p-4 max-h-60 overflow-y-auto">
                {grades.map((grade) => (
                  <FormField
                    key={grade.id}
                    control={form.control}
                    name="assignedGradeIds"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={grade.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(grade.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, grade.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== grade.id
                                      )
                                    )
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {grade.nameSi}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
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
            {isLoading ? "Saving..." : "Save Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
