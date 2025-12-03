"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Shield, Plus, Trash2, Edit } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { PrefectsMenu } from "@/components/prefects/prefects-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { usePrefects, useAddPrefectStudent, useRemovePrefectStudent, useUpdatePrefectStudent } from "@/hooks/usePrefects";
import { usePrefectPositions } from "@/hooks/usePrefectPositions";
import { PrefectStudentForm } from "@/components/prefects/PrefectStudentForm";
import { AddPrefectStudentPayload } from "@/services/masterdata/prefects.service";
import { DeleteConfirmationModal } from "@/components/reusable";

export default function PrefectYearDetailPage() {
  const params = useParams();
  const yearId = params.yearId as string; // Note: The route should be /prefects/[yearId] but the list returns ID. 
  // Wait, the list endpoint returns an array of objects. We need to find the one with this ID or fetch detail if available.
  // The hook `usePrefects` fetches ALL. We can filter.
  
  const { data: prefectYears = [], isLoading } = usePrefects();
  const { data: positions = [] } = usePrefectPositions();
  
  const yearData = prefectYears.find((y: any) => (y.id || y._id) === yearId);
  
  const addStudentMutation = useAddPrefectStudent();
  const removeStudentMutation = useRemovePrefectStudent();
  const updateStudentMutation = useUpdatePrefectStudent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);

  const handleAddStudent = (data: AddPrefectStudentPayload) => {
    addStudentMutation.mutate({ yearId, payload: data }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingStudent(null);
      },
    });
  };

  const handleUpdateStudent = (data: AddPrefectStudentPayload) => {
    if (!editingStudent) return;
    updateStudentMutation.mutate(
      { yearId, studentId: editingStudent.studentId, payload: data },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingStudent(null);
        },
      },
    );
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudentMutation.mutate({ yearId, studentId }, {
      onSuccess: () => setStudentToRemove(null),
    });
  };

  const getPositionNames = (ids: string[]) => {
    if (!ids || ids.length === 0) return "None";
    return ids.map(id => positions.find(p => p.id === id)?.nameEn).filter(Boolean).join(", ");
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!yearData) return <div className="p-8 text-center">Prefect year not found.</div>;

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <PrefectsMenu />

      <DynamicPageHeader
        title={`Prefect Guild ${yearData.year}`}
        subtitle={`Manage prefects for the year ${yearData.year}.`}
        icon={Shield}
        actions={
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Prefect
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              Appointed Prefects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {(!yearData.students || yearData.students.length === 0) ? (
                <div className="p-8 text-center text-sm text-slate-500">No prefects appointed yet.</div>
              ) : (
                yearData.students.map((student: any) => (
                  <div
                    key={student.studentId}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{student.studentNameEn || "Unknown Name"}</p>
                      <div className="flex gap-2 text-sm text-slate-500 mt-1">
                        <span className="capitalize font-semibold text-blue-600">{student.rank.replace("-", " ")}</span>
                        <span>•</span>
                        <span>{getPositionNames(student.positionIds)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-blue-600"
                        onClick={() => {
                          setEditingStudent(student);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-500 hover:text-red-600"
                        onClick={() => setStudentToRemove(student.studentId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingStudent ? "Update Prefect" : "Appoint Prefect"}</DialogTitle>
          </DialogHeader>
          <PrefectStudentForm
            mode={editingStudent ? "edit" : "add"}
            defaultValues={
              editingStudent
                ? {
                    studentId: editingStudent.studentId,
                    rank: editingStudent.rank,
                    positionIds: editingStudent.positionIds,
                  }
                : undefined
            }
            onSubmit={editingStudent ? handleUpdateStudent : handleAddStudent}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingStudent(null);
            }}
            isLoading={addStudentMutation.isPending || updateStudentMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!studentToRemove}
        onClose={() => setStudentToRemove(null)}
        onConfirm={() => studentToRemove && handleRemoveStudent(studentToRemove)}
        itemName="this prefect"
        isLoading={removeStudentMutation.isPending}
      />
    </LayoutController>
  );
}
