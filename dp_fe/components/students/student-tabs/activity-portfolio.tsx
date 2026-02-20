"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Trophy, 
  Activity, 
  Calendar, 
  Star, 
  Shield, 
  Clock, 
  Flame,
  Award,
  History,
  Medal,
  Globe,
  MapPin,
  CheckCircle2,
  Crown
} from "lucide-react";
import type { Student360 } from "@/types/models";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ActivityPortfolioProps {
  data: Student360;
}

export function StudentActivityPortfolio({ data }: ActivityPortfolioProps) {
  const { 
    houseHistory = [], 
    prefectHistory = [], 
    clubs = [], 
    competitionWins = [], 
    higherTeams = [], 
    events = [],
    competitions = [] 
  } = data;

  const currentHouse = houseHistory[0];
  const currentPrefectRank = prefectHistory[0]?.myEntry?.rank;

  return (
    <div className="space-y-8 max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* 1. Leadership & Institutional Roles Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Leadership & Institutional Roles</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prefect Career */}
          <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Crown className="h-4 w-4 text-primary" /> Council Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {prefectHistory.length > 0 ? (
                <div className="space-y-4">
                  {prefectHistory.map((pref, idx) => (
                    <div key={idx} className={cn(
                      "p-4 rounded-2xl border flex items-center justify-between",
                      idx === 0 ? "bg-indigo-50 border-indigo-100 ring-1 ring-indigo-200/50" : "bg-white border-slate-100"
                    )}>
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm border",
                          idx === 0 ? "bg-white text-indigo-600 border-indigo-100" : "bg-slate-50 text-slate-400 border-slate-100"
                        )}>
                          {pref.myEntry?.rank.includes('head') ? '🥇' : '👑'}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 leading-none capitalize">{pref.myEntry?.rank}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Appointed {format(new Date(pref.appointedDate), 'yyyy')}</p>
                        </div>
                      </div>
                      {idx === 0 && (
                        <Badge className="bg-emerald-500 text-white border-none text-[9px] font-black uppercase">Active</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                   <Crown className="h-10 w-10 mx-auto opacity-10 mb-2" />
                   <p className="text-xs font-semibold">No council appointments recorded</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* House History */}
          <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" /> House Affiliations
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {houseHistory.map((house, idx) => (
                  <div key={idx} className={cn(
                    "p-4 rounded-2xl border flex items-center justify-between",
                    idx === 0 ? getHouseBg(house.houseId?.color) : "bg-white border-slate-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center text-xl shadow-sm border",
                        idx === 0 ? "bg-white border-transparent" : "bg-slate-50 border-slate-100"
                      )}>
                        🏠
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 leading-none">{house.houseId?.nameEn}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{house.year} Assignment</p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase">Primary</Badge>
                    )}
                  </div>
                ))}
                {houseHistory.length === 0 && (
                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs font-semibold">No house history available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 2. Higher Level Representation (Zonal/National) Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-l-4 border-amber-500 pl-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">External Representation & Higher Teams</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {higherTeams.length > 0 ? (
            higherTeams.map((team, idx) => (
              <Card key={idx} className="border-none shadow-sm ring-1 ring-amber-100 bg-amber-50/10 overflow-hidden">
                <CardHeader className="bg-amber-100/30 border-b border-amber-100 pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xs font-black flex items-center gap-2 uppercase tracking-widest text-amber-700">
                      <Globe className="h-3.5 w-3.5" /> {team.level} Level
                    </CardTitle>
                    <Badge variant="outline" className="border-amber-200 text-amber-900 bg-white font-black h-5 text-[9px] uppercase">{team.year}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  {team.entries.map((entry, eIdx) => (
                    <div key={eIdx} className="bg-white p-3 rounded-xl border border-amber-100/50 shadow-sm flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 shrink-0">
                         <span className="text-sm font-black">#{entry.place}</span>
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">{entry.competitionId?.nameEn}</p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase mt-0.5">External Selection</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <Globe className="h-12 w-12 mx-auto text-slate-200 mb-3" />
              <h3 className="text-sm font-bold text-slate-500">No External Representations</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto italic">Records for Zonal, District, or National level participations will appear here once achieved.</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Comprehensive Competition & Event Ledger */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-l-4 border-emerald-500 pl-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Competitive Portfolio & School Events</h2>
        </div>

        <Card className="border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50/30 border-b border-slate-100 py-4 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <History className="h-4 w-4 text-emerald-500" /> Full Engagement History
            </CardTitle>
            <div className="flex gap-2">
               <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold px-2 py-0.5 h-6 text-[10px] uppercase">
                 {competitions.length} Participations
               </Badge>
               <Badge className="bg-amber-50 text-amber-700 border-none font-bold px-2 py-0.5 h-6 text-[10px] uppercase">
                 {competitionWins.length} Victories
               </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[9px]">Scope</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-400 uppercase tracking-widest text-[9px]">Event / Competition Name</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-widest text-[9px]">Year</th>
                    <th className="px-6 py-4 text-center font-bold text-slate-400 uppercase tracking-widest text-[9px]">Result / Status</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-400 uppercase tracking-widest text-[9px]">Engagement Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {/* Wins First */}
                  {competitionWins.map((win, idx) => (
                    <tr key={`win-${idx}`} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           {getScopeIcon(win.competitionId?.scope)}
                           <span className="text-[10px] font-black text-slate-500 uppercase">{win.competitionId?.scope || 'School'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 group-hover:text-primary transition-colors">{win.competitionId?.nameEn}</span>
                          <span className="text-[10px] font-bold text-slate-400">{win.competitionId?.nameSi}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-black text-slate-600">{win.year}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-amber-600 text-white border-none font-black px-2.5 py-1 text-[10px] shadow-sm ring-2 ring-white">
                          WINNER - PLACE {win.place}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-amber-600 uppercase">
                            <Star className="h-3 w-3 fill-amber-500 stroke-none" /> Achievement
                         </span>
                      </td>
                    </tr>
                  ))}
                  {/* Other Participations */}
                  {competitions.map((comp, idx) => (
                    // Only show if not already in wins
                    !competitionWins.some(w => w.competitionId?._id === comp.competitionId?._id) && (
                      <tr key={`comp-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                             {getScopeIcon(comp.competitionId?.scope)}
                             <span className="text-[10px] font-black text-slate-400 uppercase">{comp.competitionId?.scope || 'School'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{comp.competitionId?.nameEn}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-500">{comp.year}</td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="border-slate-200 text-slate-400 font-bold px-2 py-0 h-5 text-[9px] uppercase">Participated</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Main Stream</span>
                        </td>
                      </tr>
                    )
                  ))}
                  {/* General Events */}
                  {events.map((ev, idx) => (
                    <tr key={`ev-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <Calendar className="h-3 w-3 text-blue-400" />
                           <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Activity</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">{ev.eventId?.nameEn}</td>
                      <td className="px-6 py-4 text-center font-bold text-slate-400">{ev.year}</td>
                      <td className="px-6 py-4 text-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="px-6 py-4 text-right">
                         <span className="text-[10px] font-black text-slate-300 uppercase">Registration</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(competitionWins.length + competitions.length + events.length) === 0 && (
                <div className="py-20 text-center text-slate-300">
                   <p className="text-sm font-black uppercase tracking-[0.2em]">No Portfolio History Found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 4. Club & Society Memberships */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 border-l-4 border-indigo-500 pl-4">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Clubs & Cultural Memberships</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           {clubs.map((club, idx) => (
             <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                   <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl border border-indigo-100 group-hover:scale-110 transition-transform">
                     🏢
                   </div>
                   <Badge variant="outline" className="border-emerald-100 bg-emerald-50 text-emerald-700 font-black text-[9px] h-5 uppercase">Active</Badge>
                </div>
                <h5 className="font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{club.nameEn}</h5>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Member Since {club.year}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                   <Users className="h-3 w-3 text-slate-300" />
                   <span className="text-[10px] font-black text-slate-400 uppercase">School Organization</span>
                </div>
             </div>
           ))}
           {clubs.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-sm font-semibold italic">No active club memberships recorded</p>
             </div>
           )}
        </div>
      </section>
    </div>
  );
}

// Helper specific to Activity Portfolio
function getHouseBg(color?: string) {
  switch (color) {
    case 'Red': return "bg-red-50 border-red-100 ring-1 ring-red-200/50";
    case 'Blue': return "bg-blue-50 border-blue-100 ring-1 ring-blue-200/50";
    case 'Green': return "bg-emerald-50 border-emerald-100 ring-1 ring-emerald-200/50";
    case 'Yellow': return "bg-amber-50 border-amber-100 ring-1 ring-amber-200/50";
    default: return "bg-slate-50 border-slate-100";
  }
}

function getScopeIcon(scope?: string) {
  switch (scope?.toLowerCase()) {
    case 'zonal': return <MapPin className="h-3.5 w-3.5 text-orange-400" />;
    case 'district': return <MapPin className="h-3.5 w-3.5 text-amber-500" />;
    case 'provincial': return <Globe className="h-3.5 w-3.5 text-blue-500" />;
    case 'national': return <Globe className="h-3.5 w-3.5 text-red-500" />;
    case 'international': return <Globe className="h-3.5 w-3.5 text-indigo-600" />;
    default: return <Award className="h-3.5 w-3.5 text-slate-400" />;
  }
}
