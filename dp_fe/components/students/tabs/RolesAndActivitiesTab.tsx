"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  CheckCircle2, 
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  Flame,
  Star,
  Activity,
  UserCheck,
  Building,
  Club,
  ArrowUpRight,
  History,
  FileText,
  Map,
  Globe
} from "lucide-react";
import type { Student360 } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface RolesAndActivitiesTabProps {
  data: Student360;
}

export function RolesAndActivitiesTab({ data }: RolesAndActivitiesTabProps) {
  const { 
    houseHistory = [], 
    prefectHistory = [], 
    clubs = [], 
    competitionWins = [], 
    higherTeams = [], 
    events = [],
    competitions = [] 
  } = data;

  const currentHouse = houseHistory[0]?.houseId;
  const currentPrefectEntry = prefectHistory[0]?.myEntry;

  // Split wins into Internal (House) and External if level is traceable, 
  // but based on user prompt, we treat competitionWins as House Competitions 
  // and higherTeams as External (Zonal/District/National).
  
  const interactionJournal = useMemo(() => {
    return [...events, ...competitions].sort((a,b) => (b.year || 0) - (a.year || 0));
  }, [events, competitions]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* 1. Institutional Identity Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-4">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border shadow-sm",
            (currentHouse as any)?.color === 'Red' ? "bg-red-50 text-red-600 border-red-100" :
            (currentHouse as any)?.color === 'Blue' ? "bg-blue-50 text-blue-600 border-blue-100" :
            (currentHouse as any)?.color === 'Green' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
            (currentHouse as any)?.color === 'Yellow' ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-slate-50 text-slate-400 border-slate-100"
          )}>
            <Building className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">House Cluster</p>
            <p className="text-sm font-black text-slate-900">{(currentHouse as any)?.nameEn || "General"}</p>
          </div>
        </div>

        <div className="p-5 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-4">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center border shadow-sm",
            currentPrefectEntry ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-300 border-slate-100"
          )}>
            <Award className={cn("h-5 w-5", currentPrefectEntry && "fill-indigo-500")} />
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Prefect Council</p>
            <p className="text-sm font-black text-slate-900 leading-none capitalize">{currentPrefectEntry?.rank || "General Student"}</p>
          </div>
        </div>
      </div>

      {/* 2. Balanced Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section: High-Volume Data (House Competitions & Journal) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* House Competitions Ledger */}
          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <Trophy className="h-3.5 w-3.5" /> House Competitions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/10 border-b border-slate-50">
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Year</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Competition</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right w-32">Place</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {competitionWins.length > 0 ? (
                      competitionWins.map((win, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] font-black text-slate-900">{win.year}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p className="text-[11px] font-bold text-slate-700 leading-tight">{win.competitionId?.nameEn || "N/A"}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                             <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-black px-1.5 h-4.5 rounded uppercase">
                               Place {win.place}
                             </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-[10px] text-slate-300 font-bold uppercase italic italic tracking-widest">
                           No internal wins recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Interaction Journal Ledger */}
          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> Interaction & Engagement Journal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/10 border-b border-slate-50">
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest w-24">Year</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest">Registered Activity</th>
                      <th className="px-5 py-3.5 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {interactionJournal.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <span className="text-[11px] font-black text-slate-600">{item.year}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-[11px] font-bold text-slate-700 truncate">
                            {(item as any).eventId?.nameEn || (item as any).competitionId?.nameEn}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {(item as any).eventId ? "Event" : "Entry"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {interactionJournal.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-5 py-10 text-center text-[10px] text-slate-300 font-bold uppercase italic">No entries found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Low-Volume & Grouped Data (External & Clubs) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* External Zonal/National Ledger */}
          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
               <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                 <Globe className="h-3.5 w-3.5" /> External Representation
               </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {higherTeams.length > 0 ? (
                    higherTeams.map((team, idx) => (
                      <div key={idx} className="p-0">
                         <div className="bg-indigo-50/30 px-5 py-2 border-b border-indigo-100/50 flex items-center justify-between">
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{team.level} Level</span>
                            <span className="text-[9px] font-bold text-indigo-400">{team.year}</span>
                         </div>
                         <table className="w-full text-left">
                            <tbody className="divide-y divide-slate-50">
                               {team.entries.map((entry, eIdx) => (
                                  <tr key={eIdx} className="text-[11px]">
                                     <td className="px-5 py-3 font-bold text-slate-700">
                                        {entry.competitionId?.nameEn}
                                     </td>
                                     <td className="px-5 py-3 text-right">
                                        <Badge className="bg-indigo-100 text-indigo-700 text-[8px] font-black uppercase h-4 py-0 border-none">
                                           Place {entry.place}
                                        </Badge>
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[10px] text-slate-300 font-bold uppercase italic">
                       No external representations identified
                    </div>
                  )}
                </div>
             </CardContent>
          </Card>

          {/* Club Memberships Ledger */}
          <Card className="border-none shadow-none ring-1 ring-slate-100 bg-white overflow-hidden rounded-xl">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 px-5">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                  <Users className="h-3.5 w-3.5" /> Institutional Clubs
                </CardTitle>
             </CardHeader>
             <CardContent className="p-0">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-slate-50">
                      {clubs.map((club, idx) => (
                         <tr key={idx} className="text-[11px]">
                            <td className="px-5 py-3">
                               <p className="font-bold text-slate-700 leading-tight">{club.nameEn}</p>
                               <p className="text-[9px] text-slate-400">{club.nameSi}</p>
                            </td>
                            <td className="px-5 py-3 text-right">
                               <Badge className="bg-slate-100 text-slate-500 text-[8px] font-black uppercase h-4 border-none">Member</Badge>
                            </td>
                         </tr>
                      ))}
                      {clubs.length === 0 && (
                         <tr>
                            <td className="px-5 py-10 text-center text-[10px] text-slate-300 font-bold uppercase italic">No memberships identified</td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </CardContent>
          </Card>

        </div>
      </div>

    </div>
  );
}
