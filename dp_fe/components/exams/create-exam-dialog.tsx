"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  MultiSelect,
} from "@/components/ui";
import { useCreateExam } from "@/hooks/useExams";
import { useGrades } from "@/hooks/useGrades";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

export function CreateExamDialog({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { data: grades = [] } = useGrades();
  const createExamMutation = useCreateExam();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date>(new Date());
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [examType, setExamType] = useState<'SRIANANDA' | 'DEPARTMENT'>('SRIANANDA');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      nameSi: "",
      nameEn: "",
    }
  });

  const onSubmit = (data: any) => {
    if (selectedGrades.length === 0) {
      toast({ title: "Validation Error", description: "Select at least one class.", variant: "destructive" });
      return;
    }

    createExamMutation.mutate({
      ...data,
      date,
      type: examType,
      gradeIds: selectedGrades,
      year: new Date().getFullYear(),
    }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Exam paper created successfully." });
        reset();
        setSelectedGrades([]);
        onClose();
      },
      onError: (err) => {
        toast({ title: "Error", description: String(err), variant: "destructive" });
      }
    });
  };

  const gradeOptions = grades.map(g => ({ label: g.nameEn, value: g.id }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Exam Paper</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nameSi">Paper Name (Sinhala) <span className="text-red-500">*</span></Label>
              <Input 
                id="nameSi" 
                {...register("nameSi", { required: true })} 
                placeholder="උදා: ගණිතය - පළමු වාරය"
                className={cn(errors.nameSi && "border-red-500")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameEn">Paper Name (English) <span className="text-red-500">*</span></Label>
              <Input 
                id="nameEn" 
                {...register("nameEn", { required: true })} 
                placeholder="e.g. Mathematics - Term 1" 
                className={cn(errors.nameEn && "border-red-500")}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select value={examType} onValueChange={(v: any) => setExamType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SRIANANDA">SRIANANDA</SelectItem>
                  <SelectItem value="DEPARTMENT">DEPARTMENT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exam Date</Label>
              <DatePicker date={date} setDate={(d) => d && setDate(d)} />
            </div>
          </div>


          <div className="space-y-2">
            <Label>Effecting Classes</Label>
            <MultiSelect
              options={gradeOptions}
              value={selectedGrades}
              onValueChange={setSelectedGrades}
              placeholder="Select classes..."
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={createExamMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExamMutation.isPending} className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100">
              {createExamMutation.isPending ? "Creating..." : "Create Paper"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
