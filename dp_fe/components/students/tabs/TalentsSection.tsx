"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Star, 
  Award, 
  Shield, 
  Zap, 
  Sparkles, 
  MapPin, 
  Globe,
  Milestone,
  Medal,
  Dribbble,
  Music,
  Palette,
  Lightbulb
} from "lucide-react";
import type { Student360, StudentTalent } from "@/types/models";
import { cn } from "@/lib/utils";

interface TalentsSectionProps {
  data: Student360;
  onAddTalent: (talent: any) => void;
  onRemoveTalent: (talentId: string) => void;
}

export function TalentsSection({ data, onAddTalent, onRemoveTalent }: TalentsSectionProps) {
  const talents = useMemo(() => data.talents || [], [data.talents]);
  
  const [formData, setFormData] = useState({
    areaEn: "",
    level: "school",
    notes: "",
  });

  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"level" | "name">("level");

  const filteredAndSortedTalents = useMemo(() => {
    let filtered = [...talents];

    if (filterLevel !== "all") {
      filtered = filtered.filter((t) => t.level === filterLevel);
    }

    filtered.sort((a, b) => {
      if (sortBy === "name") return (a.areaEn || "").localeCompare(b.areaEn || "");
      const order: Record<string, number> = {
        international: 0,
        national: 1,
        provincial: 2,
        district: 3,
        zonal: 4,
        school: 5,
      };
      return (order[a.level || "school"] || 99) - (order[b.level || "school"] || 99);
    });

    return filtered;
  }, [talents, filterLevel, sortBy]);

  const handleAddTalent = () => {
    if (!formData.areaEn.trim()) return;
    onAddTalent(formData);
    setFormData({
      areaEn: "",
      level: "school",
      notes: "",
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Skill Acquisition Form */}
      <Card className="border-none shadow-none ring-1 ring-slate-100 overflow-hidden bg-white rounded-xl">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
            <Lightbulb className="h-3.5 w-3.5 text-primary" /> Endorse Student Talent Record
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mastery Area</label>
              <Input
                value={formData.areaEn}
                onChange={(e) => setFormData((p) => ({ ...p, areaEn: e.target.value }))}
                placeholder="e.g., Classical Piano, Table Tennis, Debate"
                className="h-9 bg-white border-slate-200 text-xs font-bold"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Recognition</label>
              <Select
                value={formData.level}
                onValueChange={(val) => setFormData((p) => ({ ...p, level: val }))}
              >
                <SelectTrigger className="h-9 bg-white border-slate-200 text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School Level</SelectItem>
                  <SelectItem value="zonal">Zonal Level</SelectItem>
                  <SelectItem value="district">District Level</SelectItem>
                  <SelectItem value="provincial">Provincial Level</SelectItem>
                  <SelectItem value="national">National Level</SelectItem>
                  <SelectItem value="international">International Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-4 items-end">
             <div className="flex-1 space-y-2 w-full">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Auxiliary Notes</label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="briefly describe specific mastery or awards…"
                  className="h-9 bg-white border-slate-200 text-xs font-medium"
                />
             </div>
             <Button
                onClick={handleAddTalent}
                className="h-9 px-6 gap-2 bg-primary hover:bg-primary/90 rounded-lg text-xs font-bold"
                disabled={!formData.areaEn.trim()}
              >
                <Plus className="h-3.5 w-3.5" /> Log Achievement
              </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Recorded Portfolio Ledger */}
      {talents.length > 0 && (
         <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Talent Ledger</h3>
                  <Badge className="bg-slate-100 text-slate-500 border-none font-black h-4 text-[8px] uppercase">{talents.length} Entries</Badge>
               </div>
               
               <div className="flex gap-2">
                  <Select value={filterLevel} onValueChange={setFilterLevel}>
                    <SelectTrigger className="h-7 w-24 bg-white text-[9px] font-black border-slate-200">
                      <SelectValue placeholder="Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="zonal">Zonal</SelectItem>
                      <SelectItem value="district">District</SelectItem>
                      <SelectItem value="provincial">Provincial</SelectItem>
                      <SelectItem value="national">National</SelectItem>
                      <SelectItem value="international">International</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                    <SelectTrigger className="h-7 w-20 bg-white text-[9px] font-black border-slate-200">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="level">Prestige</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedTalents.map((talent, idx) => (
                <div
                  key={idx}
                  className="group relative bg-white border border-slate-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                     <div className={cn(
                       "h-10 w-10 rounded-lg flex items-center justify-center border shadow-sm transition-transform",
                       getLevelColorClass(talent.level || 'school')
                     )}>
                       {getLevelIcon(talent.level || 'school')}
                     </div>
                     <Button
                       onClick={() => onRemoveTalent(talent.id)}
                       variant="ghost"
                       size="icon"
                       className="h-6 w-6 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Trash2 className="h-3.5 w-3.5" />
                     </Button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-black text-slate-800 leading-tight text-[13px]">{talent.areaEn}</h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <Badge className={cn("text-[8px] font-black uppercase tracking-tighter h-4 border-none py-0", getLevelBadgeStyles(talent.level || "school"))}>
                        {talent.level} Selection
                      </Badge>
                      {talent.starLevel === 2 && (
                         <Badge className="bg-amber-100 text-amber-700 h-4 border-none py-0 text-[8px] font-black uppercase">Elite Tier</Badge>
                      )}
                    </div>
                  </div>

                  {talent.notes && (
                     <p className="text-[10px] text-slate-500 mt-3 line-clamp-2 leading-relaxed italic font-medium">&quot;{talent.notes}&quot;</p>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex gap-0.5">
                        {[1, 2, 3, 4].map(s => (
                          <Star key={s} className={cn(
                            "h-3 w-3",
                            s <= getPrestigeNum(talent.level || 'school') 
                              ? "fill-amber-400 text-amber-400" : "text-slate-100"
                          )} />
                        ))}
                     </div>
                     <span className="text-[8px] font-black text-slate-300 uppercase">Profiled Record</span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {talents.length === 0 && (
         <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/10">
            <Zap className="h-10 w-10 mx-auto text-slate-200 mb-2" />
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Digital Portfolio Empty</h4>
            <p className="text-[11px] text-slate-200 mt-1 max-w-xs mx-auto italic">No identified talents or mastery areas have been officialized for this profile.</p>
         </div>
      )}
    </div>
  );
}

// Visual Helpers
function getLevelIcon(level: string) {
  switch (level.toLowerCase()) {
    case 'international': return <Globe className="h-5 w-5" />;
    case 'national': return <Award className="h-5 w-5" />;
    case 'provincial': return <Milestone className="h-5 w-5" />;
    case 'district': return <MapPin className="h-5 w-5" />;
    case 'zonal': return <MapPin className="h-5 w-5" />;
    default: return <Shield className="h-5 w-5" />;
  }
}

function getLevelColorClass(level: string) {
  switch (level.toLowerCase()) {
    case 'international': return "bg-indigo-50 text-indigo-600 border-indigo-100";
    case 'national': return "bg-red-50 text-red-600 border-red-100";
    case 'provincial': return "bg-orange-50 text-orange-600 border-orange-100";
    case 'district': return "bg-amber-50 text-amber-600 border-amber-100";
    case 'zonal': return "bg-blue-50 text-blue-600 border-blue-100";
    default: return "bg-slate-50 text-slate-400 border-slate-200";
  }
}

function getLevelBadgeStyles(level: string) {
  const styles: Record<string, string> = {
    school: "bg-slate-100 text-slate-600",
    zonal: "bg-blue-50 text-blue-700",
    district: "bg-amber-50 text-amber-700",
    provincial: "bg-orange-50 text-orange-700",
    national: "bg-red-50 text-red-700",
    international: "bg-indigo-50 text-indigo-700",
  };
  return styles[level.toLowerCase()] || "bg-slate-100 text-slate-800";
}

function getPrestigeNum(level: string) {
  switch (level.toLowerCase()) {
    case 'international': return 4;
    case 'national': return 3;
    case 'provincial':
    case 'district': return 2;
    default: return 1;
  }
}
