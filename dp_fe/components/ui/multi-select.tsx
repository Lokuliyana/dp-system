"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (optionValue: string) => {
    onValueChange(value.filter((v) => v !== optionValue));
  };

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      handleUnselect(optionValue);
    } else {
      onValueChange([...value, optionValue]);
    }
  };

  const toggleSelectAll = () => {
    if (value.length === options.length) {
      onValueChange([]);
    } else {
      onValueChange(options.map((o) => o.value));
    }
  };

  const isAllSelected = options.length > 0 && value.length === options.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-10 py-2 bg-white hover:bg-white text-left",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {value.length > 0 ? (
              options
                .filter((option) => value.includes(option.value))
                .map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none px-2 py-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUnselect(option.value);
                    }}
                  >
                    {option.label}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 border shadow-md bg-white pointer-events-auto overflow-hidden" 
        style={{ width: "var(--radix-popover-trigger-width)" }}
        align="start"
      >
        <div className="flex flex-col max-h-72">
          {options.length > 0 && (
            <div 
              className="flex items-center justify-between px-3 py-2 border-b bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={toggleSelectAll}
            >
              <span className="text-sm font-bold text-slate-700">Select All</span>
              <div className={cn(
                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                isAllSelected ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"
              )}>
                {isAllSelected && <Check className="h-3 w-3 text-white" />}
              </div>
            </div>
          )}
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="p-1">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center justify-between px-2 py-2 rounded-sm cursor-pointer hover:bg-slate-100 transition-all",
                    value.includes(option.value) && "bg-slate-50 text-indigo-700 font-medium"
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  <span className="text-sm">{option.label}</span>
                  {value.includes(option.value) && (
                    <Check className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
              ))}
              {options.length === 0 && (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No options available
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  );
}
