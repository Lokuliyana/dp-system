"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Alert,
  AlertDescription
} from "@/components/ui";
import { Loader, Wand2, Info } from "lucide-react";
import { studentsService } from "@/services/students.service";
import { useBulkAssignHouse } from "@/hooks/useHouseAssignments";
import { useToast } from "@/hooks/use-toast";

interface AutomaticAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  grades: any[];
  houses: any[];
  year: number;
}

export function AutomaticAssignmentDialog({
  isOpen,
  onClose,
  grades,
  houses,
  year,
}: AutomaticAssignmentDialogProps) {
  const [fromGradeId, setFromGradeId] = useState<string>("");
  const [toGradeId, setToGradeId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const bulkAssign = useBulkAssignHouse({ year });
  const { toast } = useToast();

  const handleProcess = async () => {
    if (!fromGradeId || !toGradeId) {
      toast({ title: "Please select grade range", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const fromGrade = grades.find(g => g.id === fromGradeId);
      const toGrade = grades.find(g => g.id === toGradeId);

      if (!fromGrade || !toGrade) return;

      // Filter grades in range
      const gradesInRange = grades.filter(g => 
        g.level >= Math.min(fromGrade.level, toGrade.level) && 
        g.level <= Math.max(fromGrade.level, toGrade.level)
      );

      const allStudentsToAssign: { studentId: string; houseId: string; gradeId: string }[] = [];

      for (const grade of gradesInRange) {
        const students = await studentsService.listByGrade(grade.id, year);
        
        students.forEach(student => {
          // Extract last 3 digits from admission number
          // Logic: take only numeric characters, then take last 3
          const numericPart = student.admissionNumber.replace(/\D/g, "");
          const last3 = numericPart.slice(-3);
          const numValue = parseInt(last3, 10);

          if (!isNaN(numValue)) {
            const houseIndex = numValue % houses.length;
            const assignedHouse = houses[houseIndex];
            
            allStudentsToAssign.push({
              studentId: student.id,
              houseId: assignedHouse.id,
              gradeId: grade.id
            });
          }
        });
      }

      if (allStudentsToAssign.length === 0) {
        toast({ title: "No students found in the selected range", variant: "default" });
        setIsProcessing(false);
        return;
      }

      if (houses.length === 0) {
        toast({ title: "No houses available for assignment", variant: "destructive" });
        setIsProcessing(false);
        return;
      }

      await bulkAssign.mutateAsync({
        assignments: allStudentsToAssign,
        year
      });

      toast({ 
        title: "Success", 
        description: `Automatically assigned ${allStudentsToAssign.length} students to houses.` 
      });
      onClose();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to perform automatic assignment", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-indigo-500" />
            Automatic House Assignment
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs text-blue-700">
              Students will be assigned based on the last 3 digits of their admission number divided by the number of houses ({houses.length}).
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From Grade</Label>
              <Select value={fromGradeId} onValueChange={setFromGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g.id} value={g.id}>Grade {g.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To Grade</Label>
              <Select value={toGradeId} onValueChange={setToGradeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(g => (
                    <SelectItem key={g.id} value={g.id}>Grade {g.level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleProcess} disabled={isProcessing} className="bg-indigo-600 hover:bg-indigo-700">
            {isProcessing ? (
              <Loader className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Process Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
