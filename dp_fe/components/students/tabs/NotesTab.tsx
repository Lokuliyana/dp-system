"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Badge } from "@/components/ui";
import { Plus, Trash2, FileText, Lock, Calendar } from "lucide-react";
import { NOTE_CATEGORIES, type StudentNote } from "@/lib/school-data";

interface NotesTabProps {
  notes: StudentNote[];
  onAddNote: (note: Omit<StudentNote, "id" | "date">) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesTab({ notes, onAddNote, onDeleteNote }: NotesTabProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "academic" as const,
    author: "Teacher",
    isPrivate: true,
  });

  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes];

    if (filterCategory !== "all") {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }

    filtered.sort((a, b) => {
      const aD = new Date(a.date).getTime();
      const bD = new Date(b.date).getTime();
      return sortBy === "date-desc" ? bD - aD : aD - bD;
    });

    return filtered;
  }, [notes, filterCategory, sortBy]);

  const handleAddNote = () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    onAddNote(formData);
    setFormData({
      title: "",
      content: "",
      category: "academic",
      author: "Teacher",
      isPrivate: true,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800",
      behavioral: "bg-purple-100 text-purple-800",
      health: "bg-green-100 text-green-800",
      personal: "bg-indigo-100 text-indigo-800",
      achievement: "bg-yellow-100 text-yellow-800",
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
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Progress in Mathematics"
              className="bg-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
                  {NOTE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Author</label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData((p) => ({ ...p, author: e.target.value }))}
                placeholder="Teacher name"
                className="bg-white"
              />
            </div>
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

          <div className="flex items-center gap-2">
            <input
              id="isPrivate"
              type="checkbox"
              checked={formData.isPrivate}
              onChange={(e) => setFormData((p) => ({ ...p, isPrivate: e.target.checked }))}
              className="rounded"
            />
            <label
              htmlFor="isPrivate"
              className="flex items-center gap-2 text-sm font-medium text-slate-700"
            >
              <Lock className="h-4 w-4" />
              Private note (staff only)
            </label>
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
                    {NOTE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
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
              filteredAndSortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="space-y-2 rounded-lg border border-slate-200 p-4 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{note.title}</h3>
                        <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                        {note.isPrivate && (
                          <Badge
                            variant="outline"
                            className="border-yellow-200 text-xs text-yellow-700"
                          >
                            <Lock className="mr-1 h-3 w-3" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.date).toLocaleDateString()}
                        </span>
                        <span>By {note.author}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteNote(note.id)}
                      className="flex-shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
