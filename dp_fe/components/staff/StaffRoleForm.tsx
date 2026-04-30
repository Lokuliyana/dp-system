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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateStaffRolePayload } from "@/services/masterdata/staffRoles.service";
import { Checkbox } from "@/components/ui/checkbox";
import { useGrades } from "@/hooks/useGrades";
import { useTeachers } from "@/hooks/useTeachers";
import { useFieldArray, useWatch } from "react-hook-form";
import { LiveSearch } from "@/components/reusable";
import { useState, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";

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

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        {children}
      </p>
      <div className="flex-1 border-t border-dashed border-slate-200" />
    </div>
  );
}

export function StaffRoleForm({ defaultValues, onSubmit, isLoading, onCancel }: StaffRoleFormProps) {
  const { data: grades = [] } = useGrades();
  const { data: teachers = [] } = useTeachers();
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");

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

  const searchableTeachers = useMemo(
    () => teachers.map((t: any) => ({ ...t, displayName: t.fullNameEn ?? `${t.firstNameEn} ${t.lastNameEn}` })),
    [teachers],
  );

  const filteredTeachers = useMemo(() => {
    const q = teacherSearchTerm.trim().toLowerCase();
    if (!q) return searchableTeachers;
    return searchableTeachers.filter((t: any) => t.displayName.toLowerCase().includes(q));
  }, [searchableTeachers, teacherSearchTerm]);

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "responsibilities" });
  const gradeBased = useWatch({ control: form.control, name: "gradeBased" });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* ── Basic Info ─────────────────────────────────── */}
        <SectionHeading>Basic Information</SectionHeading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="nameEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (English)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Head of Department" {...field} />
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
                  <Input placeholder="e.g. දෙපාර්තමේන්තු ප්‍රධානී" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptionEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (English)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief description of this role…" rows={3} {...field} />
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
                  <Textarea placeholder="භූමිකාවේ විස්තරය…" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* ── Grade Settings ─────────────────────────────── */}
        <SectionHeading>Grade Settings</SectionHeading>

        <div className="flex flex-col sm:flex-row gap-6">
          <FormField
            control={form.control}
            name="gradeBased"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2.5">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                  />
                </FormControl>
                <div>
                  <FormLabel className="m-0 cursor-pointer">Grade-based role</FormLabel>
                  <p className="text-xs text-muted-foreground">This role is tied to specific grades.</p>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="singleGraded"
            render={({ field }) => (
              <FormItem className={`flex items-center gap-2.5 ${!gradeBased ? "opacity-40 pointer-events-none" : ""}`}>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(!!checked)}
                    disabled={!gradeBased}
                  />
                </FormControl>
                <div>
                  <FormLabel className="m-0 cursor-pointer">Single grade only</FormLabel>
                  <p className="text-xs text-muted-foreground">Teacher assigned to one grade at a time.</p>
                </div>
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
                <FormLabel>Grades Covered</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 border rounded-md p-3 max-h-48 overflow-y-auto bg-slate-50/50">
                  {grades.map((g) => (
                    <label key={g.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
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

        {/* ── Responsibilities ───────────────────────────── */}
        <SectionHeading>Responsibilities</SectionHeading>

        <div className="space-y-3">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No responsibilities added yet.</p>
          ) : (
            fields.map((fieldItem, idx) => (
              <div key={fieldItem.id} className="grid grid-cols-1 sm:grid-cols-[140px_1fr_1fr_auto] gap-3 border rounded-md p-3 bg-slate-50/50">
                {/* Level */}
                <FormField
                  control={form.control}
                  name={`responsibilities.${idx}.level`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Level</FormLabel>
                      <Select
                        value={String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Primary</SelectItem>
                          <SelectItem value="2">Secondary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* English */}
                <FormField
                  control={form.control}
                  name={`responsibilities.${idx}.textEn`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Responsibility (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lead grade activities" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Sinhala */}
                <FormField
                  control={form.control}
                  name={`responsibilities.${idx}.textSi`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Responsibility (Sinhala)</FormLabel>
                      <FormControl>
                        <Input placeholder="භාර කටයුතු" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Remove */}
                <div className="flex items-end pb-0.5 justify-end sm:justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => remove(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => append({ level: 1, textSi: "", textEn: "" })}
          >
            <Plus className="h-4 w-4" />
            Add Responsibility
          </Button>
        </div>

        {/* ── Assign Teachers ────────────────────────────── */}
        <SectionHeading>Assign Teachers</SectionHeading>

        <FormField
          control={form.control}
          name="teacherIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teachers</FormLabel>
              <FormControl>
                <LiveSearch
                  data={filteredTeachers}
                  labelKey="displayName"
                  valueKey="id"
                  multiple
                  onSearch={setTeacherSearchTerm}
                  selected={(_, ids) => field.onChange(ids)}
                  defaultSelected={field.value}
                  placeholder="Search and add teachers…"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Ordering ───────────────────────────────────── */}
        <SectionHeading>Display Order</SectionHeading>

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem className="max-w-[160px]">
              <FormLabel>Order / Priority</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">Lower number = higher in hierarchy.</p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
