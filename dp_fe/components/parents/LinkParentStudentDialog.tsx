"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGrades } from "@/hooks/useGrades";
import { useStudentsByGrade } from "@/hooks/useStudents";
import { parentStudentLinksService } from "@/services/parentStudentLinks.service";
import { useToast } from "@/hooks/use-toast";
import type { Parent } from "@/types/models";

const schema = z.object({
  gradeId: z.string().min(1, "Select a grade"),
  studentId: z.string().min(1, "Select a student"),
  relationshipEn: z.string().min(1, "Relationship is required"),
  relationshipSi: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

type LinkParentStudentDialogProps = {
  parent: Parent | null;
  open: boolean;
  onClose: () => void;
  onLinked?: (studentName: string) => void;
};

export function LinkParentStudentDialog({ parent, open, onClose, onLinked }: LinkParentStudentDialogProps) {
  const { data: grades = [] } = useGrades();
  const [selectedGradeId, setSelectedGradeId] = useState<string>("");
  const { data: students = [] } = useStudentsByGrade(selectedGradeId);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      gradeId: "",
      studentId: "",
      relationshipEn: "",
      relationshipSi: "",
      isPrimary: false,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset({
        gradeId: "",
        studentId: "",
        relationshipEn: "",
        relationshipSi: "",
        isPrimary: false,
      });
      setSelectedGradeId("");
    }
  }, [open, form]);

  const handleSubmit = async (values: z.infer<typeof schema>) => {
    const parentId = (parent as any)?.id || (parent as any)?._id;
    if (!parentId) {
      toast({ title: "Parent missing", description: "Cannot link without a valid parent record", variant: "destructive" });
      return;
    }
    try {
      await parentStudentLinksService.link({
        parentId,
        studentId: values.studentId,
        relationshipEn: values.relationshipEn,
        relationshipSi: values.relationshipSi,
        isPrimary: values.isPrimary,
      });
      const student = students.find((s) => s.id === values.studentId);
      onLinked?.(student ? `${student.firstNameEn} ${student.lastNameEn}` : values.studentId);
      toast({ title: "Parent linked to student" });
      onClose();
    } catch (err) {
      toast({ title: "Failed to link parent", description: String(err), variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Link Parent to Student</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="gradeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val);
                      setSelectedGradeId(val);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {grades.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.nameEn}
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
                  <FormLabel>Student</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={!selectedGradeId}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.firstNameEn} {s.lastNameEn} ({s.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="relationshipEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship (English)</FormLabel>
                    <FormControl>
                      <Input placeholder="Mother / Father / Guardian" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="relationshipSi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relationship (Sinhala)</FormLabel>
                    <FormControl>
                      <Input placeholder="මව / පියා" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                    />
                  </FormControl>
                  <FormLabel className="m-0">Mark as primary contact</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Link Parent</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
