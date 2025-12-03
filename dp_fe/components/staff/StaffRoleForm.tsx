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
import { Textarea } from "@/components/ui/textarea";
import { CreateStaffRolePayload } from "@/services/masterdata/staffRoles.service";
import { Checkbox } from "@/components/ui/checkbox";
import { useGrades } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { useFieldArray, useWatch } from "react-hook-form";

const roleSchema = z.object({
  nameSi: z.string().min(1, "Sinhala name is required"),
  nameEn: z.string().min(1, "Name (English) is required"),
  gradeBased: z.boolean().optional(),
  singleGraded: z.boolean().optional(),
  gradesEffected: z.array(z.string()).optional(),
  responsibilities: z
    .array(
      z.object({
        level: z.union([z.literal(1), z.literal(2)]),
        textSi: z.string().min(1),
        textEn: z.string().min(1),
      }),
    )
    .optional(),
  descriptionSi: z.string().optional(),
  descriptionEn: z.string().optional(),
  teacherIds: z.array(z.string()).optional(),
  order: z.number().int().optional(),
}).refine(
  (values) => {
    if (values.gradeBased) {
      return Array.isArray(values.gradesEffected) && values.gradesEffected.length > 0;
    }
    return true;
  },
  { message: "Select at least one grade when grade-based", path: ["gradesEffected"] },
);

interface StaffRoleFormProps {
  defaultValues?: Partial<CreateStaffRolePayload>;
  onSubmit: (data: CreateStaffRolePayload) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function StaffRoleForm({ defaultValues, onSubmit, isLoading, onCancel }: StaffRoleFormProps) {
  const { data: grades = [] } = useGrades();
  const { data: teachers = [] } = useTeachers();

  const form = useForm<CreateStaffRolePayload>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      nameSi: "",
      nameEn: "",
      gradeBased: false,
      singleGraded: false,
      gradesEffected: [],
      responsibilities: [],
      descriptionSi: "",
      descriptionEn: "",
      teacherIds: [],
      order: 0,
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "responsibilities",
  });

  const gradeBased = useWatch({ control: form.control, name: "gradeBased" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="Name (English)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nameSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (Sinhala)</FormLabel>
                <FormControl>
                  <Input placeholder="Name (Sinhala)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Role Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Role Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionSi"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Sinhala)</FormLabel>
                <FormControl>
                  <Textarea placeholder="වැඩ වගකීම්" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gradeBased"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <FormLabel className="m-0">Grade-based role</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="singleGraded"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                    disabled={!gradeBased}
                  />
                </FormControl>
                <FormLabel className="m-0">Single grade only</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {gradeBased && (
          <FormField
            control={form.control}
            name="gradesEffected"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grades covered</FormLabel>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-44 overflow-y-auto">
                  {grades.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm text-slate-700">
                      <Checkbox
                        checked={field.value?.includes(g.id)}
                        onCheckedChange={(checked) =>
                          checked
                            ? field.onChange([...(field.value || []), g.id])
                            : field.onChange(field.value?.filter((id) => id !== g.id))
                        }
                      />
                      <span>{g.nameEn}</span>
                    </label>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Responsibilities</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ level: 1, textSi: "", textEn: "" })}
            >
              Add responsibility
            </Button>
          </div>
          {fields.length === 0 && (
            <p className="text-sm text-slate-500">No responsibilities added yet.</p>
          )}
          {fields.map((fieldItem, idx) => (
            <div key={fieldItem.id} className="grid grid-cols-4 gap-2 border rounded-md p-3">
              <FormField
                control={form.control}
                name={`responsibilities.${idx}.level`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value={1}>Primary</option>
                        <option value={2}>Secondary</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`responsibilities.${idx}.textEn`}
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Responsibility (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lead grade activities" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`responsibilities.${idx}.textSi`}
                render={({ field }) => (
                  <FormItem className="col-span-1">
                    <FormLabel>Responsibility (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="භාර කටයුතු" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(idx)}
                  className="text-red-600"
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="teacherIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assign teachers</FormLabel>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                {teachers.map((teacher) => (
                  <label key={teacher.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <Checkbox
                      checked={field.value?.includes(teacher.id)}
                      onCheckedChange={(checked) =>
                        checked
                          ? field.onChange([...(field.value || []), teacher.id])
                          : field.onChange(field.value?.filter((id) => id !== teacher.id))
                      }
                    />
                    <span>{teacher.fullNameEn ?? `${teacher.firstNameEn} ${teacher.lastNameEn}`}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order / Priority</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
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
            {isLoading ? "Saving..." : "Save Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
