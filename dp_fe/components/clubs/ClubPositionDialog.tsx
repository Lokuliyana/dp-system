"use client";

import React, { useEffect, useState } from "react";
import { Shield, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PermissionGuard } from "@/components/auth/permission-guard";
import { cn } from "@/lib/utils";

export interface ClubPositionFormData {
  nameSi: string;
  nameEn: string;
  responsibilitySi: string;
  responsibilityEn: string;
}

interface ClubPositionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClubPositionFormData) => void;
  onEdit: (pos: any) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  editingId?: string | null;
  defaultValues?: Partial<ClubPositionFormData>;
  positions: any[];
}

export function ClubPositionDialog({
  isOpen,
  onClose,
  onSubmit,
  onEdit,
  onDelete,
  isLoading = false,
  editingId,
  defaultValues,
  positions,
}: ClubPositionDialogProps) {
  const [formData, setFormData] = useState<ClubPositionFormData>({
    nameSi: "",
    nameEn: "",
    responsibilitySi: "",
    responsibilityEn: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    } else {
      setFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
    }
  }, [defaultValues, editingId]);

  const set = (key: keyof ClubPositionFormData, value: string) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleEditClick = (pos: any) => {
    setFormData({
      nameEn: pos.nameEn || "",
      nameSi: pos.nameSi || "",
      responsibilityEn: pos.responsibilityEn || "",
      responsibilitySi: pos.responsibilitySi || "",
    });
    onEdit(pos);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-200">
              <Shield className="h-4 w-4 text-indigo-700" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {editingId ? "Edit Position" : "Add New Position"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">
          {/* Create / Edit form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Position Name (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.nameEn}
                  onChange={e => set("nameEn", e.target.value)}
                  placeholder="e.g. President"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Position Name (Sinhala) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.nameSi}
                  onChange={e => set("nameSi", e.target.value)}
                  placeholder="උදා: සභාපති"
                  required
                  className="h-10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Responsibilities (English)</Label>
                <Textarea
                  value={formData.responsibilityEn}
                  onChange={e => set("responsibilityEn", e.target.value)}
                  placeholder="Describe responsibilities..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Responsibilities (Sinhala)</Label>
                <Textarea
                  value={formData.responsibilitySi}
                  onChange={e => set("responsibilitySi", e.target.value)}
                  placeholder="වගකීම් විස්තර කරන්න..."
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFormData({ nameSi: "", nameEn: "", responsibilitySi: "", responsibilityEn: "" });
                    onEdit(null);
                  }}
                >
                  Cancel Edit
                </Button>
              )}
              <Button type="submit" size="sm" disabled={isLoading} className="gap-1.5">
                {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editingId ? "Save Changes" : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add Position
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Existing positions */}
          {positions.length > 0 && (
            <div className="border-t px-6 py-4 space-y-2 bg-slate-50/40">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                Existing Positions ({positions.length})
              </p>
              <div className="space-y-2">
                {positions.map(pos => (
                  <div
                    key={pos.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border bg-white transition-colors",
                      editingId === pos.id ? "border-indigo-300 bg-indigo-50/40" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{pos.nameEn}</p>
                      <p className="text-xs text-slate-500">{pos.nameSi}</p>
                    </div>
                    <div className="flex gap-1">
                      <PermissionGuard permission="activities.club_position.update">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-indigo-600"
                          onClick={() => handleEditClick(pos)}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                      <PermissionGuard permission="activities.club_position.delete">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-slate-400 hover:text-red-600"
                          onClick={() => onDelete(pos.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t bg-white">
          <Button type="button" variant="outline" onClick={onClose}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
