// components/list/StudentSearchBar.tsx
"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui";

interface StudentSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  performanceFilter: string;
  onPerformanceFilterChange: (value: string) => void;
  sortBy: "name" | "roll" | "performance";
  onSortByChange: (value: "name" | "roll" | "performance") => void;
}

export function StudentSearchBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  performanceFilter,
  onPerformanceFilterChange,
  sortBy,
  onSortByChange,
}: StudentSearchBarProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
      <div className="relative md:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name, email, or roll number..."
          className="h-10 pl-9"
        />
      </div>

      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusFilterChange(v)}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={performanceFilter}
        onValueChange={(v) => onPerformanceFilterChange(v)}
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Performance" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Levels</SelectItem>
          <SelectItem value="excellent">Excellent</SelectItem>
          <SelectItem value="good">Good</SelectItem>
          <SelectItem value="average">Average</SelectItem>
          <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sortBy}
        onValueChange={(v) =>
          onSortByChange(v as "name" | "roll" | "performance")
        }
      >
        <SelectTrigger className="h-10">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="roll">Roll Number</SelectItem>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="performance">Performance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
