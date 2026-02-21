"use client";

import { useState } from "react";
import { Shield, Plus, Edit, Trash2 } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { PrefectsMenu } from "@/components/prefects/prefects-menu";
import { Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui";
import { usePrefectPositions, useCreatePrefectPosition, useUpdatePrefectPosition, useDeletePrefectPosition } from "@/hooks/usePrefectPositions";
import { PrefectPositionForm } from "@/components/prefects/PrefectPositionForm";
import { CreatePrefectPositionPayload } from "@/services/masterdata/prefectPositions.service";
import { DeleteConfirmationModal } from "@/components/reusable";
import type { PrefectPosition } from "@/types/models";

export default function PrefectPositionsPage() {
  const { data: positions = [], isLoading: isLoadingPositions } = usePrefectPositions();
  
  const createMutation = useCreatePrefectPosition();
  const updateMutation = useUpdatePrefectPosition();
  const deleteMutation = useDeletePrefectPosition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PrefectPosition | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

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

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <PrefectsMenu />

      <DynamicPageHeader
        title="Prefect Positions"
        subtitle="Manage master data for prefect positions and responsibilities."
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-900">
              All Defined Positions
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
    </LayoutController>
  );
}

