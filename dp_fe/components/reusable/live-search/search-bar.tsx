"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  onSearch: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  className,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="absolute left-3 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        onChange={(e) => onSearch(e.target.value)}
        className="pl-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}
