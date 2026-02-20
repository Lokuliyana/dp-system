"use client";

import * as React from "react";
import { Search, Calendar as CalendarIcon, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

/**
 * Standard Header Button
 */
interface HeaderButtonProps extends React.ComponentProps<typeof Button> {
  icon?: LucideIcon;
}


export function HeaderButton({
  icon: Icon,
  children,
  className,
  variant = "outline",
  size = "sm",
  ...props
}: HeaderButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "h-9 px-3 text-xs font-semibold gap-2 border-slate-200 shadow-sm transition-all hover:bg-slate-50 active:scale-95",
        variant === "default" && "bg-slate-900 text-white hover:bg-slate-800 border-none",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}

/**
 * Standard Header Select
 */
interface HeaderSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  label?: string;
  icon?: LucideIcon;
}

export function HeaderSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
  label,
  icon: Icon,
}: HeaderSelectProps) {
  return (
    <div className="flex items-center gap-2 group">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors">
          {label}
        </span>
      )}
      <div className="relative">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={cn(
              "h-9 min-w-[120px] bg-white border-slate-200 text-xs font-medium shadow-sm hover:border-slate-300 transition-all focus:ring-1 focus:ring-slate-400",
              className
            )}
          >
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-3.5 w-3.5 text-slate-400" />}
              <SelectValue placeholder={placeholder} />
            </div>
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

/**
 * Standard Header Date Picker
 */
interface HeaderDatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  disabled?: (date: Date) => boolean;
  label?: string;
}

export function HeaderDatePicker({
  date,
  setDate,
  disabled,
  label,
}: HeaderDatePickerProps) {
  return (
    <div className="flex items-center gap-2 group">
      {label && (
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-500 transition-colors">
          {label}
        </span>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-medium text-xs border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:bg-white transition-all min-w-[140px]",
              !date && "text-slate-400"
            )}
          >
            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
            {date ? format(date, "MMM dd, yyyy") : <span>Pick date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={disabled}
            initialFocus
            className="rounded-md border-none"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Standard Header Search
 */
interface HeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function HeaderSearch({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: HeaderSearchProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-[180px] md:w-[240px] pl-9 bg-slate-50/50 border-slate-200 text-xs focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-slate-400 transition-all placeholder:text-slate-400 font-medium"
      />
    </div>
  );
}

export type HeaderAction = 
  | { type: "button"; props: HeaderButtonProps }
  | { type: "select"; props: HeaderSelectProps }
  | { type: "date"; props: HeaderDatePickerProps }
  | { type: "search"; props: HeaderSearchProps }
  | { type: "custom"; render: React.ReactNode };
