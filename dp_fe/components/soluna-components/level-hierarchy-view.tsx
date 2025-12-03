"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export interface LevelItem {
  id: string;
  label: string;
  data?: any;
}

export interface Level {
  id: string;
  label: string;
  items: LevelItem[];
  color?: string; // Optional color for the level
}

interface LevelHierarchyViewProps {
  levels: Level[];
  renderItem?: (item: LevelItem) => React.ReactNode;
  onItemClick?: (item: LevelItem) => void;
  className?: string;
}

const LevelSection = ({
  level,
  index,
  renderItem,
  onItemClick,
  isLast,
}: {
  level: Level;
  index: number;
  renderItem?: (item: LevelItem) => React.ReactNode;
  onItemClick?: (item: LevelItem) => void;
  isLast: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="relative flex flex-col"
    >
      {/* Connecting Line to next level */}
      {!isLast && (
        <div className="absolute left-[1.15rem] top-8 bottom-0 w-px bg-border/50 -z-10" />
      )}

      {/* Level Header */}
      <div className="flex items-center gap-3 py-2 group">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full border bg-background hover:bg-accent hover:text-accent-foreground shrink-0 z-10 transition-all",
              level.color ? `border-${level.color.split('-')[1]}-500/50 text-${level.color.split('-')[1]}-600` : "border-border"
            )}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <span className="text-xs font-bold">{index + 1}</span>
            )}
          </Button>
        </CollapsibleTrigger>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold tracking-tight uppercase text-muted-foreground/80">
              {level.label}
            </h3>
            <span className="text-xs text-muted-foreground/50 font-mono">
              ({level.items.length})
            </span>
          </div>
          <div className="h-px flex-1 bg-border/40" />
        </div>
      </div>

      {/* Level Items Grid */}
      <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
        <div className="ml-[1.15rem] pl-6 pb-6 pt-2 border-l border-border/50 border-dashed">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {level.items.map((item) => (
              <div
                key={item.id}
                onClick={() => onItemClick?.(item)}
                className={cn(
                  "transition-all duration-200",
                  onItemClick && "cursor-pointer hover:-translate-y-0.5"
                )}
              >
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <Card className="rounded-sm border shadow-sm hover:shadow-md hover:border-primary/30 transition-all bg-card/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="h-8 w-8 rounded bg-muted/50 flex items-center justify-center text-muted-foreground text-xs font-medium border border-border/50">
                        {item.label.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm truncate leading-none mb-1">{item.label}</span>
                        {item.data?.role && (
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                            {item.data.role}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export function LevelHierarchyView({
  levels,
  renderItem,
  onItemClick,
  className,
}: LevelHierarchyViewProps) {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {levels.map((level, index) => (
        <LevelSection
          key={level.id}
          level={level}
          index={index}
          renderItem={renderItem}
          onItemClick={onItemClick}
          isLast={index === levels.length - 1}
        />
      ))}
    </div>
  );
}
