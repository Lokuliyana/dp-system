"use client";

import { useState, useMemo } from "react";
import { Shield, Plus, Edit, Trash2, ListTree, LayoutList } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { PrefectsMenu } from "@/components/prefects/prefects-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui";
import { usePrefectPositions, useCreatePrefectPosition, useUpdatePrefectPosition, useDeletePrefectPosition } from "@/hooks/usePrefectPositions";
import { usePrefects } from "@/hooks/usePrefects";
import { PrefectPositionForm } from "@/components/prefects/PrefectPositionForm";
import { CreatePrefectPositionPayload } from "@/services/masterdata/prefectPositions.service";
import { DeleteConfirmationModal } from "@/components/reusable";
import { LevelHierarchyView, Level, LevelItem } from "@/components/soluna-components/level-hierarchy-view";
import type { PrefectPosition } from "@/types/models";

export default function PrefectPositionsPage() {
  const { data: positions = [], isLoading: isLoadingPositions } = usePrefectPositions();
  const { data: prefectYears = [], isLoading: isLoadingPrefects } = usePrefects();
  
  const createMutation = useCreatePrefectPosition();
  const updateMutation = useUpdatePrefectPosition();
  const deleteMutation = useDeletePrefectPosition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PrefectPosition | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [selectedPrefect, setSelectedPrefect] = useState<LevelItem | null>(null);

  const handleSave = (data: CreatePrefectPositionPayload) => {
    if (editingPosition) {
      updateMutation.mutate({ id: editingPosition.id, payload: data }, {
        onSuccess: () => {
          setIsModalOpen(false);
          setEditingPosition(null);
        },
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleEdit = (position: PrefectPosition) => {
    setEditingPosition(position);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setItemToDelete(null),
    });
  };

  // Hierarchy Data Transformation
  const hierarchyLevels: Level[] = useMemo(() => {
    if (!positions.length || !prefectYears.length) return [];

    // Flatten all active prefects from all years (or filter by current year if needed)
    // For now, we'll take the latest year as "Active"
    const latestYear = prefectYears[0]; // Assuming sorted by year desc
    if (!latestYear?.students) return [];

    const activePrefects = latestYear.students;

    // Sort positions by rankLevel
    const sortedPositions = [...positions].sort((a, b) => (a.rankLevel || 999) - (b.rankLevel || 999));

    return sortedPositions.map((pos, index) => {
      // Find prefects who have this position
      const posPrefects = activePrefects.filter((p: any) => p.positionIds?.includes(pos.id));

      return {
        id: pos.id,
        label: pos.nameEn,
        color: `bg-${['blue', 'purple', 'green', 'orange', 'red', 'indigo'][index % 6]}-500`,
        items: posPrefects.map((p: any) => ({
          id: p.studentId,
          label: p.studentNameEn || "Unknown Student",
          data: {
            role: pos.nameEn,
            rank: p.rank,
            prefect: p // Store full object
          }
        }))
      };
    }).filter(level => level.items.length > 0);
  }, [positions, prefectYears]);

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

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <PrefectsMenu />

      <DynamicPageHeader
        title="Prefect Positions"
        subtitle="Manage prefect positions and responsibilities."
        icon={Shield}
        actions={
          <Button className="gap-2" onClick={() => {
            setEditingPosition(null);
            setIsModalOpen(true);
          }}>
            <Plus className="h-4 w-4" />
            Add Position
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

          <TabsContent value="list">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  All Positions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {isLoadingPositions ? (
                    <div className="p-8 text-center text-sm text-slate-500">Loading positions...</div>
                  ) : positions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-slate-500">No positions found.</div>
                  ) : (
                    positions.map((pos) => (
                      <div
                        key={pos.id}
                        className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{pos.nameEn}</p>
                          <p className="text-sm text-slate-500">{pos.nameSi}</p>
                          {pos.rankLevel && <p className="text-xs text-slate-400 mt-1">Rank Level: {pos.rankLevel}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                            onClick={() => handleEdit(pos)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-red-600"
                            onClick={() => setItemToDelete(pos.id)}
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
          </TabsContent>

          <TabsContent value="hierarchy">
            <Card>
              <CardContent className="p-6">
                {isLoadingPositions || isLoadingPrefects ? (
                  <div className="p-8 text-center text-sm text-slate-500">Loading hierarchy...</div>
                ) : hierarchyLevels.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No hierarchy data available. Assign positions to prefects to see them here.
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

      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setEditingPosition(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPosition ? "Edit Position" : "Add New Position"}</DialogTitle>
          </DialogHeader>
          <PrefectPositionForm
            defaultValues={editingPosition ? {
              nameSi: editingPosition.nameSi,
              nameEn: editingPosition.nameEn,
              responsibilitySi: editingPosition.responsibilitySi,
              responsibilityEn: editingPosition.responsibilityEn,
              descriptionSi: editingPosition.descriptionSi,
              descriptionEn: editingPosition.descriptionEn,
              rankLevel: editingPosition.rankLevel,
            } : undefined}
            onSubmit={handleSave}
            onCancel={() => setIsModalOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDelete(itemToDelete)}
        itemName="this position"
        isLoading={deleteMutation.isPending}
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
                  {selectedPrefect?.data?.role}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Rank</h4>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="capitalize">{selectedPrefect?.data?.rank || 'Prefect'}</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </LayoutController>
  );
}
