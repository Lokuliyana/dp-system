"use client";

import React, { useEffect, useState } from "react";
import { Users, Globe, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LiveSearch } from "@/components/reusable";

export interface ClubFormData {
  nameSi: string;
  nameEn: string;
  descriptionSi: string;
  descriptionEn: string;
  teacherInChargeId: string;
  year: number;
}

interface ClubFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClubFormData) => void;
  isEditing?: boolean;
  isLoading?: boolean;
  defaultValues?: Partial<ClubFormData>;
  filteredTeachers: any[];
  onTeacherSearch: (q: string) => void;
}

export function ClubFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isEditing = false,
  isLoading = false,
  defaultValues,
  filteredTeachers,
  onTeacherSearch,
}: ClubFormDialogProps) {
  const [formData, setFormData] = useState<ClubFormData>({
    nameSi: "",
    nameEn: "",
    descriptionSi: "",
    descriptionEn: "",
    teacherInChargeId: "",
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    } else {
      setFormData({
        nameSi: "",
        nameEn: "",
        descriptionSi: "",
        descriptionEn: "",
        teacherInChargeId: "",
        year: new Date().getFullYear(),
      });
    }
  }, [defaultValues, isOpen]);

  const set = (key: keyof ClubFormData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
              <Users className="h-4 w-4 text-purple-700" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Club / Society" : "Create Club / Society"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[70vh] overflow-y-auto px-6 py-5 space-y-6">

            {/* Club Name */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Club Name</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    English <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.nameEn}
                    onChange={e => set("nameEn", e.target.value)}
                    required
                    placeholder="e.g. Science Society"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Sinhala <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.nameSi}
                    onChange={e => set("nameSi", e.target.value)}
                    required
                    placeholder="උදා: විද්‍යා සංගමය"
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-px bg-slate-100" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">English</Label>
                  <Textarea
                    value={formData.descriptionEn}
                    onChange={e => set("descriptionEn", e.target.value)}
                    placeholder="Brief description..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Sinhala</Label>
                  <Textarea
                    value={formData.descriptionSi}
                    onChange={e => set("descriptionSi", e.target.value)}
                    placeholder="කෙටි විස්තරය..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3">
              <div className="h-px bg-slate-100" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Settings</p>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Master In Charge</Label>
                  <LiveSearch
                    data={filteredTeachers}
                    labelKey="displayName"
                    valueKey="id"
                    onSearch={onTeacherSearch}
                    selected={val => set("teacherInChargeId", val.item?.id || "")}
                    defaultSelected={formData.teacherInChargeId}
                    placeholder="Search teacher..."
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Active Year</Label>
                  <Input
                    type="number"
                    value={formData.year}
                    onChange={e => set("year", Number(e.target.value))}
                    required
                    min={2000}
                    max={2100}
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2 min-w-[120px]">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Club"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
