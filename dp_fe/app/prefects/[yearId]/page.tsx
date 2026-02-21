"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Shield, Plus, Trash2, Edit, ListTree, LayoutList } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { PrefectsMenu } from "@/components/prefects/prefects-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui";
import { usePrefects, useAddPrefectStudent, useRemovePrefectStudent, useUpdatePrefectStudent } from "@/hooks/usePrefects";
import { usePrefectPositions } from "@/hooks/usePrefectPositions";
import { PrefectStudentForm } from "@/components/prefects/PrefectStudentForm";
import { AddPrefectStudentPayload } from "@/services/masterdata/prefects.service";
import { DeleteConfirmationModal } from "@/components/reusable";
import { LevelHierarchyView, Level, LevelItem } from "@/components/soluna-components/level-hierarchy-view";

export default function PrefectYearDetailPage() {
  const params = useParams();
  const yearId = params.yearId as string;
  
  const { data: prefectYears = [], isLoading } = usePrefects();
  const { data: positions = [] } = usePrefectPositions();
  
  const yearData = prefectYears.find((y: any) => (y.id || y._id) === yearId);
  
  const addStudentMutation = useAddPrefectStudent();
  const removeStudentMutation = useRemovePrefectStudent();
  const updateStudentMutation = useUpdatePrefectStudent();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  const [selectedPrefect, setSelectedPrefect] = useState<LevelItem | null>(null);

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

  const rankOrder: Record<string, number> = {
    "head-prefect": 1,
    "deputy-head-prefect": 2,
    "senior-prefect": 3,
    "junior-prefect": 4,
    "primary-prefect": 5,
  };

  const rankLabels: Record<string, string> = {
    "head-prefect": "Head Prefect (ප්‍රධාන ශිෂ්‍ය නායක)",
    "deputy-head-prefect": "Deputy Head Prefect (උප ප්‍රධාන ශිෂ්‍ය නායක)",
    "senior-prefect": "Senior Prefect (ජ්‍යෙෂ්ඨ ශිෂ්‍ය නායක)",
    "junior-prefect": "Junior Prefect (කනිෂ්ඨ ශිෂ්‍ය නායක)",
    "primary-prefect": "Primary Prefect (ප්‍රාථමික ශිෂ්‍ය නායක)",
  };

  // Hierarchy Data Transformation
  const hierarchyLevels: Level[] = useMemo(() => {
    if (!yearData?.students || yearData.students.length === 0) return [];

    const grouped = yearData.students.reduce((acc: any, student: any) => {
      const rank = student.rank || "prefect";
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(student);
      return acc;
    }, {});

    const sortedRanks = Object.keys(grouped).sort((a, b) => 
      (rankOrder[a] || 99) - (rankOrder[b] || 99)
    );

    return sortedRanks.map((rank, index) => ({
      id: rank,
      label: rankLabels[rank] || rank,
      color: `bg-${['blue', 'purple', 'green', 'orange', 'red'][index % 5]}-500`,
      items: grouped[rank].map((p: any) => ({
        id: p.studentId,
        label: p.studentNameEn || p.studentNameSi || "Unknown Name",
        data: {
          role: getPositionNames(p.positionIds),
          rank: rank,
          prefect: p
        }
      }))
    }));
  }, [yearData, positions]);

  const renderHierarchyItem = (item: LevelItem) => {
    return (
      <div className="group relative flex items-center gap-3 p-3 rounded-md border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200">
        <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors font-medium text-xs">
          {item.label.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm truncate text-foreground/90">{item.label}</span>
          <span className="text-[11px] text-muted-foreground truncate uppercase tracking-wide">{item.data?.role}</span>
        </div>
      </div>
    );
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!yearData) return <div className="p-8 text-center">Prefect year not found.</div>;

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <PrefectsMenu />

      <DynamicPageHeader
        title={`Prefect Guild ${yearData.year}`}
        subtitle={`Manage and view prefect hierarchy for the year ${yearData.year}.`}
        icon={Shield}
        actions={
          <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Prefect
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="hierarchy" className="gap-2">
                <ListTree className="h-4 w-4" />
                Hierarchy View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="space-y-6">
            {(!yearData.students || yearData.students.length === 0) ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-slate-500">
                  No prefects appointed yet.
                </CardContent>
              </Card>
            ) : (
              (() => {
                const grouped = yearData.students.reduce((acc: any, student: any) => {
                  const rank = student.rank || "prefect";
                  if (!acc[rank]) acc[rank] = [];
                  acc[rank].push(student);
                  return acc;
                }, {});

                const sortedRanks = Object.keys(grouped).sort((a, b) => 
                  (rankOrder[a] || 99) - (rankOrder[b] || 99)
                );

                return sortedRanks.map((rank) => (
                  <Card key={rank}>
                    <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/50">
                      <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-700" />
                        {rankLabels[rank] || rank.replace("-", " ")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {grouped[rank].map((student: any) => (
                          <div
                            key={student.studentId}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-slate-900">{student.studentNameSi || student.studentNameEn || "Unknown Name"}</p>
                              <p className="text-sm text-slate-500 mt-1">
                                {getPositionNames(student.positionIds)}
                              </p>
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
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()
            )}
          </TabsContent>

          <TabsContent value="hierarchy">
            <Card>
              <CardContent className="p-6">
                {hierarchyLevels.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No prefects appointed yet to show hierarchy.
                  </div>
                ) : (
                  <LevelHierarchyView
                    levels={hierarchyLevels}
                    renderItem={renderHierarchyItem}
                    onItemClick={setSelectedPrefect}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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

      <Sheet open={!!selectedPrefect} onOpenChange={(open) => !open && setSelectedPrefect(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {selectedPrefect?.label.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <SheetTitle className="text-xl">{selectedPrefect?.label}</SheetTitle>
                <SheetDescription className="text-base font-medium text-primary">
                  {selectedPrefect?.data?.rank ? rankLabels[selectedPrefect.data.rank] : 'Prefect'}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Assigned Positions / Duties</h4>
              <div className="flex items-center gap-2">
                <span className="text-sm">{selectedPrefect?.data?.role || 'None'}</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutController>
  );
}
