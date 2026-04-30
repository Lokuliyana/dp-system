"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar, Trophy, Users, Award, BookOpen, Briefcase, Layers, X, Loader2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LiveSearch } from "@/components/reusable";
import type { EventCategory } from "@/types/models";

const EVENT_CATEGORIES: {
  value: EventCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "regular",  label: "Regular",     icon: Calendar,  color: "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-400 data-[selected=true]:border-slate-600 data-[selected=true]:bg-slate-100" },
  { value: "main",     label: "Main Event",  icon: Trophy,    color: "bg-amber-50 border-amber-200 text-amber-700 hover:border-amber-400 data-[selected=true]:border-amber-600 data-[selected=true]:bg-amber-100" },
  { value: "squad",    label: "Squad Wise",  icon: Layers,    color: "bg-blue-50 border-blue-200 text-blue-700 hover:border-blue-400 data-[selected=true]:border-blue-600 data-[selected=true]:bg-blue-100" },
  { value: "club",     label: "Club Wise",   icon: Award,     color: "bg-purple-50 border-purple-200 text-purple-700 hover:border-purple-400 data-[selected=true]:border-purple-600 data-[selected=true]:bg-purple-100" },
  { value: "academic", label: "Academic",    icon: BookOpen,  color: "bg-green-50 border-green-200 text-green-700 hover:border-green-400 data-[selected=true]:border-green-600 data-[selected=true]:bg-green-100" },
  { value: "staff",    label: "Staff",       icon: Briefcase, color: "bg-rose-50 border-rose-200 text-rose-700 hover:border-rose-400 data-[selected=true]:border-rose-600 data-[selected=true]:bg-rose-100" },
];

export interface EventFormData {
  title: string;
  description: string;
  eventType: EventCategory;
  date: string;
  endDate: string;
  year: number;
  teacherInChargeId: string;
  clubId: string;
  squadId: string;
}

interface EventFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  isEditing?: boolean;
  isLoading?: boolean;
  defaultValues?: Partial<EventFormData>;
  filteredTeachers: any[];
  filteredClubs: any[];
  filteredSquads: any[];
  onTeacherSearch: (q: string) => void;
  onClubSearch: (q: string) => void;
  onSquadSearch: (q: string) => void;
}

export function EventFormDialog({
  isOpen,
  onClose,
  onSubmit,
  isEditing = false,
  isLoading = false,
  defaultValues,
  filteredTeachers,
  filteredClubs,
  filteredSquads,
  onTeacherSearch,
  onClubSearch,
  onSquadSearch,
}: EventFormDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "regular",
    date: "",
    endDate: "",
    year: new Date().getFullYear(),
    teacherInChargeId: "",
    clubId: "",
    squadId: "",
  });

  useEffect(() => {
    if (defaultValues) {
      setFormData(prev => ({ ...prev, ...defaultValues }));
    } else {
      setFormData({
        title: "",
        description: "",
        eventType: "regular",
        date: "",
        endDate: "",
        year: new Date().getFullYear(),
        teacherInChargeId: "",
        clubId: "",
        squadId: "",
      });
    }
  }, [defaultValues, isOpen]);

  const set = (key: keyof EventFormData, value: any) =>
    setFormData(prev => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedCategory = EVENT_CATEGORIES.find(c => c.value === formData.eventType);

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-5 border-b bg-white">
          <div className="flex items-center gap-3">
            {selectedCategory && (
              <div className={cn("p-2 rounded-lg border", selectedCategory.color)}>
                <selectedCategory.icon className="h-4 w-4" />
              </div>
            )}
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEditing ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] overflow-y-auto px-6 py-5 space-y-6">

            {/* Category Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Event Category
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {EVENT_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = formData.eventType === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      data-selected={isSelected}
                      onClick={() => set("eventType", cat.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer",
                        cat.color,
                        isSelected && "shadow-sm ring-2 ring-offset-1 ring-current/20"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px] font-semibold leading-tight">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="h-px bg-slate-100" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Event Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={e => set("title", e.target.value)}
                    required
                    placeholder="e.g. Annual Sports Meet"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">Year</Label>
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
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={e => set("description", e.target.value)}
                  placeholder="Brief description of the event..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-3">
              <div className="h-px bg-slate-100" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Schedule</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={e => set("date", e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    End Date <span className="text-slate-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={e => set("endDate", e.target.value)}
                    min={formData.date}
                    className="h-10"
                  />
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="space-y-3">
              <div className="h-px bg-slate-100" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Assignment</p>
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">Teacher in Charge / MIC</Label>
                <LiveSearch
                  data={filteredTeachers}
                  labelKey="displayName"
                  valueKey="id"
                  onSearch={onTeacherSearch}
                  selected={val => set("teacherInChargeId", val.item?.id || "")}
                  defaultSelected={formData.teacherInChargeId}
                  placeholder="Search and select teacher..."
                />
              </div>

              {formData.eventType === "club" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Associated Club <span className="text-red-500">*</span>
                  </Label>
                  <LiveSearch
                    data={filteredClubs}
                    labelKey="displayName"
                    valueKey="id"
                    onSearch={onClubSearch}
                    selected={val => set("clubId", val.item?.id || "")}
                    defaultSelected={formData.clubId}
                    placeholder="Search and select club..."
                  />
                </div>
              )}

              {formData.eventType === "squad" && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold text-slate-700">
                    Associated Squad <span className="text-red-500">*</span>
                  </Label>
                  <LiveSearch
                    data={filteredSquads}
                    labelKey="displayName"
                    valueKey="id"
                    onSearch={onSquadSearch}
                    selected={val => set("squadId", val.item?.id || "")}
                    defaultSelected={formData.squadId}
                    placeholder="Search and select squad..."
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-slate-50/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2 min-w-[120px]">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
