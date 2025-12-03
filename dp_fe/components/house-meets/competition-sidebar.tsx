"use client";

import { useEffect } from "react";
import { useInnerLayoutControls } from "@/components/layout/dynamic/context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Users, User, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Competition } from "@/types/models";

interface CompetitionSidebarProps {
  competitions: Competition[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CompetitionSidebar({
  competitions,
  selectedId,
  onSelect,
}: CompetitionSidebarProps) {
  const { setSidebarActions } = useInnerLayoutControls();

  // Helper to get ID
  const getId = (doc: any) => doc.id || doc._id;

  useEffect(() => {
    setSidebarActions(
      <div className="flex flex-col h-full">
        <div className="p-4 border-b bg-slate-50/50 shrink-0">
          <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-slate-500" />
            Competitions
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {competitions.map((comp) => {
              const id = getId(comp);
              const isSelected = selectedId === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 rounded-md text-sm transition-all flex flex-col gap-1 group",
                    isSelected
                      ? "bg-white shadow-sm text-blue-700 font-medium border border-blue-200 ring-1 ring-blue-100"
                      : "text-slate-600 hover:bg-slate-100 border border-transparent"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="truncate">{comp.nameSi || comp.nameEn}</span>
                    {comp.participationType === "team" ? (
                      <Users className={cn("h-3 w-3", isSelected ? "text-blue-500" : "text-slate-400")} />
                    ) : (
                      <User className={cn("h-3 w-3", isSelected ? "text-blue-500" : "text-slate-400")} />
                    )}
                  </div>
                  <div className="flex items-center gap-2 opacity-70">
                    <span className="text-[10px] uppercase tracking-wider">
                        {comp.scope}
                    </span>
                    {!comp.active && (
                      <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-slate-200 text-slate-500">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
            {competitions.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                    No competitions found.
                </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );

    return () => {
      setSidebarActions(null);
    };
  }, [competitions, selectedId, onSelect, setSidebarActions]);

  return null; // This component doesn't render anything in its parent, it portals to the layout
}
