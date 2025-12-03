"use client";

import React from "react";
import { LevelHierarchyView, Level, LevelItem } from "@/components/soluna-components/level-hierarchy-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { User, Shield, Briefcase, Users, Building2 } from "lucide-react";

const sampleLevels: Level[] = [
  {
    id: "lvl-1",
    label: "Strategic Leadership",
    color: "bg-blue-500",
    items: [
      { id: "u1", label: "Board of Directors", data: { role: "Governance", icon: Shield, department: "Corporate" } },
      { id: "u2", label: "Executive Committee", data: { role: "Strategy", icon: Shield, department: "Corporate" } },
    ],
  },
  {
    id: "lvl-2",
    label: "Executive Management",
    color: "bg-purple-500",
    items: [
      { id: "u3", label: "Chief Executive Officer", data: { role: "CEO", icon: Briefcase, department: "Executive" } },
      { id: "u4", label: "Chief Financial Officer", data: { role: "CFO", icon: Briefcase, department: "Finance" } },
      { id: "u5", label: "Chief Operating Officer", data: { role: "COO", icon: Briefcase, department: "Operations" } },
      { id: "u6", label: "Chief Technology Officer", data: { role: "CTO", icon: Briefcase, department: "Technology" } },
    ],
  },
  {
    id: "lvl-3",
    label: "Operational Management",
    color: "bg-green-500",
    items: [
      { id: "u7", label: "Sales Director", data: { role: "Director", icon: Users, department: "Sales" } },
      { id: "u8", label: "Marketing Director", data: { role: "Director", icon: Users, department: "Marketing" } },
      { id: "u9", label: "HR Director", data: { role: "Director", icon: Users, department: "Human Resources" } },
      { id: "u10", label: "Engineering Director", data: { role: "Director", icon: Users, department: "Engineering" } },
      { id: "u11", label: "Product Director", data: { role: "Director", icon: Users, department: "Product" } },
    ],
  },
  {
    id: "lvl-4",
    label: "Team Leads & Staff",
    color: "bg-orange-500",
    items: [
      { id: "u12", label: "Team Lead A", data: { role: "Lead", icon: User, department: "Engineering" } },
      { id: "u13", label: "Team Lead B", data: { role: "Lead", icon: User, department: "Sales" } },
      { id: "u14", label: "Senior Developer", data: { role: "Senior", icon: User, department: "Engineering" } },
      { id: "u15", label: "Marketing Specialist", data: { role: "Specialist", icon: User, department: "Marketing" } },
      { id: "u16", label: "HR Manager", data: { role: "Manager", icon: User, department: "HR" } },
      { id: "u17", label: "Accountant", data: { role: "Staff", icon: User, department: "Finance" } },
    ],
  },
];

export default function HierarchyDemoPage() {
  const [selectedItem, setSelectedItem] = React.useState<LevelItem | null>(null);

  const renderCustomItem = (item: LevelItem) => {
    const Icon = item.data?.icon || User;
    return (
      <div className="group relative flex items-center gap-3 p-3 rounded-md border border-border/40 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all duration-200">
        <div className="h-9 w-9 rounded-md bg-primary/5 text-primary flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium text-sm truncate text-foreground/90">{item.label}</span>
          <span className="text-[11px] text-muted-foreground truncate uppercase tracking-wide">{item.data?.role}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10 max-w-5xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organization Levels</h1>
        <p className="text-muted-foreground">
          A tiered view of the organizational structure.
        </p>
      </div>

      <div className="bg-background rounded-xl border shadow-sm p-6">
        <LevelHierarchyView
          levels={sampleLevels}
          renderItem={renderCustomItem}
          onItemClick={setSelectedItem}
        />
      </div>

      <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="space-y-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {selectedItem?.data?.icon && React.createElement(selectedItem.data.icon, { className: "h-8 w-8" })}
              </div>
              <div>
                <SheetTitle className="text-xl">{selectedItem?.label}</SheetTitle>
                <SheetDescription className="text-base font-medium text-primary">
                  {selectedItem?.data?.role}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Department</h4>
              <div className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{selectedItem?.data?.department}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Employee ID</h4>
              <div className="font-mono bg-muted p-2 rounded text-sm w-fit">
                {selectedItem?.id}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</h4>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Active</span>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
