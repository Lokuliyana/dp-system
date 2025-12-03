"use client"

import { type StudentNote, NOTE_CATEGORIES } from "@/lib/school-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"
import { useState, useMemo } from "react"
import { Plus, Trash2, FileText, Lock, Calendar } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui"
import { Badge } from "@/components/ui"

interface NotesProps {
  notes: StudentNote[]
  onAddNote: (note: Omit<StudentNote, "id" | "date">) => void
  onDeleteNote: (noteId: string) => void
}

export function StudentNotes({ notes, onAddNote, onDeleteNote }: NotesProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "academic" as const,
    author: "Teacher",
    isPrivate: true,
  })

  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc")

  const filteredAndSortedNotes = useMemo(() => {
    let filtered = [...notes]

    if (filterCategory !== "all") {
      filtered = filtered.filter((n) => n.category === filterCategory)
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortBy === "date-desc" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [notes, filterCategory, sortBy])

  const handleAddNote = () => {
    if (formData.title.trim() && formData.content.trim()) {
      onAddNote(formData)
      setFormData({ title: "", content: "", category: "academic", author: "Teacher", isPrivate: true })
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-100 text-blue-800",
      behavioral: "bg-purple-100 text-purple-800",
      health: "bg-green-100 text-green-800",
      personal: "bg-indigo-100 text-indigo-800",
      achievement: "bg-yellow-100 text-yellow-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Note Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Progress in Mathematics"
              className="bg-white border-slate-200"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="bg-white border-slate-200">
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
                onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                placeholder="Your name"
                className="bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Note Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Write your note here..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData((prev) => ({ ...prev, isPrivate: e.target.checked }))}
              className="rounded"
            />
            <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Private Note (only visible to authorized staff)
            </label>
          </div>

          <Button onClick={handleAddNote} className="bg-blue-600 hover:bg-blue-700 gap-2 w-full">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </CardContent>
      </Card>

      {notes.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Notes ({filteredAndSortedNotes.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {NOTE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-32 h-8">
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
              <p className="text-center text-slate-500 py-8">No notes in this category.</p>
            ) : (
              filteredAndSortedNotes.map((note) => (
                <div
                  key={note.id}
                  className="border border-slate-200 rounded-lg p-4 space-y-2 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-slate-900">{note.title}</h3>
                        <Badge className={getCategoryColor(note.category)}>{note.category}</Badge>
                        {note.isPrivate && (
                          <Badge variant="outline" className="text-yellow-700 border-yellow-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Private
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{note.content}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(note.date).toLocaleDateString()}
                        </span>
                        <span>By {note.author}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => onDeleteNote(note.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
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
  )
}
