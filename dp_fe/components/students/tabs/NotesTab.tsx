"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Plus, Trash2, FileText, Lock, Calendar } from "lucide-react";
import { NOTE_CATEGORIES } from "@/lib/school-data";
import type { StudentNote } from "@/types/models";

interface NotesTabProps {
  notes: StudentNote[];
  onAddNote: (note: Omit<StudentNote, "id" | "date">) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesTab({ notes, onAddNote, onDeleteNote }: NotesTabProps) {
  const [formData, setFormData] = useState({
    content: "",
    category: "academic" as StudentNoteCategory,
    createdById: "current-user-id", // Should come from auth context
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    if (filterCategory !== "all") {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }

    filtered.sort((a, b) => {
      const aD = a.notedAt ? new Date(a.notedAt).getTime() : 0;
      const bD = b.notedAt ? new Date(b.notedAt).getTime() : 0;
      return sortBy === "date-desc" ? bD - aD : aD - bD;
    });

    return filtered;
  }, [notes, filterCategory, sortBy]);

  const handleAddNote = () => {
    if (!formData.content.trim()) return;
    onAddNote(formData);
    setFormData({
      content: "",
      category: "academic",
      createdById: "current-user-id",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800",
      behaviour: "bg-purple-100 text-purple-800",
      health: "bg-green-100 text-green-800",
      achievement: "bg-yellow-100 text-yellow-800",
      other: "bg-slate-100 text-slate-800",
    };
    return colors[category] || "bg-slate-100 text-slate-800";
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Add Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Category</label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((p) => ({ ...p, category: value as any }))}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="academic">Academic Progress</SelectItem>
                <SelectItem value="behaviour">Behavior</SelectItem>
                <SelectItem value="health">Health & Wellness</SelectItem>
                <SelectItem value="achievement">Achievement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              placeholder="Write your note..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
          </div>

          <Button onClick={handleAddNote} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Recent Notes ({filteredAndSortedNotes.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="behaviour">Behavior</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                    <SelectItem value="achievement">Achievement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Newest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredAndSortedNotes.length === 0 ? (
              <p className="py-8 text-center text-slate-500">
                No notes for selected filters.
              </p>
            ) : (
              filteredAndSortedNotes.map((note, index) => (
                <div
                  key={index}
                  className="space-y-2 rounded-lg border border-slate-200 p-4 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {note.notedAt ? new Date(note.notedAt).toLocaleDateString() : "No date"}
                        </span>
                        <span>By {note.createdById}</span>
                      </div>
                    </div>
                    {/* onDeleteNote might need ID which is not in StudentNote type yet, but we can use index or add it if available */}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
