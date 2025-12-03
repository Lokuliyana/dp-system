"use client";

import type React from "react";
import { Search, Plus, Filter, MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

export interface ManagementConsoleProps {
  title: string;
  description?: string;
  icon?: React.ElementType;
  
  // Search & Filter
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  
  // Actions
  onAdd?: () => void;
  addLabel?: string;
  
  // Filter slot
  filterContent?: React.ReactNode;
  
  // Stats/KPIs
  stats?: React.ReactNode;
  
  // Main Content
  children: React.ReactNode;
  
  // Optional: if true, hides the default card wrapper around children (useful for split views)
  noContentCard?: boolean;
}

export function ManagementConsole({
  title,
  description,
  icon: Icon,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search...",
  onAdd,
  addLabel = "Add New",
  filterContent,
  stats,
  children,
  noContentCard = false,
}: ManagementConsoleProps) {
  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-6 w-6 text-blue-600" />}
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              {description}
            </p>
          )}
        </div>
        
        {onAdd && (
          <Button onClick={onAdd} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {addLabel}
          </Button>
        )}
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats}
        </div>
      )}

      {/* Toolbar (Search & Filter) */}
      {(onSearchChange || filterContent) && (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {onSearchChange && (
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-colors"
                  />
                </div>
              )}
              
              {filterContent && (
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  {filterContent}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {noContentCard ? (
        children
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-0">
            {children}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sub-components for common patterns

export function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend,
  color = "blue" 
}: { 
  label: string; 
  value: string | number; 
  icon?: React.ElementType;
  trend?: string;
  color?: "blue" | "emerald" | "amber" | "purple" | "slate";
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    slate: "bg-slate-50 text-slate-700",
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-4 flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-600">{trend}</p>}
        </div>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
