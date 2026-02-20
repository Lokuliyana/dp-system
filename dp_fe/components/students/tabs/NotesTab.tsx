"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, FileText, Lock, Calendar, MessageSquare, StickyNote, Quote, Shield } from "lucide-react";
import { NOTE_CATEGORIES } from "@/lib/school-data";
import type { StudentNote, StudentNoteCategory } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface NotesTabProps {
  notes: StudentNote[];
  onAddNote: (note: Omit<StudentNote, "id" | "notedAt">) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NotesTab({ notes, onAddNote, onDeleteNote }: NotesTabProps) {
  const [formData, setFormData] = useState({
    content: "",
    category: "academic" as StudentNoteCategory,
    createdById: "current-user-id", // Should come from auth context in a real app
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Note Entry Module */}
      <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5 text-primary" /> Post New Academic or Behavioral Entry
          </CardTitle>
          <Badge variant="outline" className="border-slate-200 text-[8px] font-black uppercase px-2 h-5">Internal Only</Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Classification</label>
                   <Select
                     value={formData.category}
                     onValueChange={(value) => setFormData((p) => ({ ...p, category: value as any }))}
                   >
                     <SelectTrigger className="h-10 bg-white border-slate-200 text-xs font-bold">
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="academic">Academic Progress</SelectItem>
                       <SelectItem value="behaviour">Student Behavior</SelectItem>
                       <SelectItem value="health">Medical & Health</SelectItem>
                       <SelectItem value="achievement">Achievement/Honor</SelectItem>
                       <SelectItem value="other">General Metadata</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="md:col-span-3 space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contextual Payload</label>
                   <div className="relative">
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
                        placeholder="Log significant observations or updates here..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] transition-all resize-none"
                      />
                   </div>
                </div>
             </div>

             <div className="flex justify-end gap-3 pt-2">
                <Button 
                   onClick={handleAddNote} 
                   className="h-10 px-8 gap-2 bg-primary hover:bg-primary/90 rounded-xl font-bold shadow-lg shadow-primary/10"
                   disabled={!formData.content.trim()}
                >
                  <Plus className="h-4 w-4" /> Securely Log Note
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Record Ledger */}
      {notes.length > 0 && (
         <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Entry Digest</h3>
                  <Badge className="bg-slate-100 text-slate-600 border-none font-black h-5 text-[9px] uppercase">{filteredAndSortedNotes.length} Records</Badge>
               </div>
               
               <div className="flex gap-2">
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="h-8 w-32 bg-white text-[10px] font-bold border-slate-200">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Logs</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="behaviour">Behavior</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="achievement">Awards</SelectItem>
                      <SelectItem value="other">Others</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="h-8 w-32 bg-white text-[10px] font-bold border-slate-200">
                      <SelectValue placeholder="Time Sequence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date-desc">Newest First</SelectItem>
                      <SelectItem value="date-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedNotes.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                   <MessageSquare className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No matching logs found</p>
                </div>
              ) : (
                filteredAndSortedNotes.map((note, index) => (
                  <div
                    key={index}
                    className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-start gap-6">
                       <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:rotate-3",
                          getCategoryStyle(note.category).bg,
                          getCategoryStyle(note.category).text,
                          getCategoryStyle(note.category).border
                       )}>
                          <Quote className="h-6 w-6" />
                       </div>
                       
                       <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Badge className={cn("text-[9px] font-black uppercase tracking-widest h-5 px-2 border-none", getCategoryStyle(note.category).bg, getCategoryStyle(note.category).text)}>
                                   {note.category}
                                </Badge>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                   <Calendar className="h-3 w-3" />
                                   {note.notedAt ? format(new Date(note.notedAt), 'MMM d, yyyy') : "Pending Timestamp"}
                                </span>
                             </div>
                             <button
                               onClick={() => onDeleteNote(index.toString())} // Should use unique ID in production
                               className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                             >
                                <Trash2 className="h-4 w-4" />
                             </button>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                            "{note.content}"
                          </p>
                          
                          <div className="pt-3 border-t border-slate-50 flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">
                             <Shield className="h-3 w-3" /> Logged By {note.createdById}
                          </div>
                       </div>
                    </div>
                  </div>
                ))
              )}
            </div>
         </div>
      )}

      {notes.length === 0 && (
         <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/20">
            <MessageSquare className="h-12 w-12 mx-auto text-slate-200 mb-4" />
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">Digital Ledger Empty</h4>
            <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto italic">No internal observations or official notes have been recorded for this student journey yet.</p>
         </div>
      )}
    </div>
  );
}

function getCategoryStyle(category: string) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    academic: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
    behaviour: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
    health: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    achievement: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100" },
    other: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-100" },
  };
  return styles[category] || styles.other;
}
