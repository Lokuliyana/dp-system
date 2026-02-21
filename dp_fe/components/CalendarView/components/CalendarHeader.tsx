import { ChevronLeft, ChevronRight, CalendarHeart, Clock, Pencil, Pin } from "lucide-react";
import { format } from "date-fns";

import { CalendarViewMode } from "../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";

const IconButtonWithToolTip = ({ icon, onClick, tooltip, className }: any) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick} className={cn("h-8 w-8", className)}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const TextIconButton = ({ icon, text, onClick, variant, className, order }: any) => (
  <Button variant={variant} onClick={onClick} className={cn("gap-2", className)}>
    {order === "ICON_FIRST" ? (
      <>
        {icon}
        <span>{text}</span>
      </>
    ) : (
      <>
        <span>{text}</span>
        {icon}
      </>
    )}
  </Button>
);

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarViewMode;
  onViewChange: (view: CalendarViewMode) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onToday: () => void;
  onYearChange: (year: number) => void;
  onShowHolidayPanel?: () => void;
  enableHolidayPanel?: boolean;
  businessHours?: string;
  onEditBusinessHours?: () => void;
}

const viewLabels: Record<CalendarViewMode, string> = {
  month: "Month",
  week: "Week",
  year: "Year",
};

export function CalendarHeader({
  currentDate,
  view,
  onViewChange,
  onNavigate,
  onToday,
  onYearChange,
  onShowHolidayPanel,
  enableHolidayPanel = true,
  businessHours = "08:00 AM to 17:00 PM",
  onEditBusinessHours,
}: CalendarHeaderProps) {
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const getHeaderTitle = () => {
    switch (view) {
      case "year":
        return format(currentDate, "yyyy");
      case "week":
        return `${format(currentDate, "MMM d")} - ${format(
          new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000),
          "MMM d, yyyy"
        )}`;
      default:
        return format(currentDate, "MMMM yyyy");
    }
  };

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2">
      {/* Left section - Navigation & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <IconButtonWithToolTip
            icon={<ChevronLeft className="h-4 w-4" />}
            onClick={() => onNavigate("prev")}
            tooltip="Previous"
            className="h-8 w-8"
          />
          <IconButtonWithToolTip
            icon={<ChevronRight className="h-4 w-4" />}
            onClick={() => onNavigate("next")}
            tooltip="Next"
            className="h-8 w-8"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 focus:outline-none">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {getHeaderTitle()}
              </span>
              <ChevronLeft className="h-4 w-4 text-slate-400 rotate-[-90deg] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[300px] overflow-y-auto">
            {years.map((year) => (
              <DropdownMenuItem
                key={year}
                onClick={() => onYearChange(year)}
                className={cn(
                  "cursor-pointer",
                  year === currentYear && "bg-primary/10 text-primary font-semibold"
                )}
              >
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Business Hours */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 ml-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Business Hours: <span className="text-slate-900 dark:text-slate-100">{businessHours}</span>
          </span>
          <button 
            onClick={onEditBusinessHours}
            className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Pencil className="h-3 w-3 text-primary" />
          </button>
        </div>
      </div>

      {/* Right section - Today & View switcher */}
      <div className="flex items-center gap-3">
        {enableHolidayPanel && onShowHolidayPanel && (
          <IconButtonWithToolTip
            icon={<CalendarHeart className="h-4 w-4" />}
            onClick={onShowHolidayPanel}
            tooltip="View Holidays"
            className="h-9 w-9 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
          />
        )}

        <TextIconButton
          icon={<Pin className="h-4 w-4" />}
          text="Today"
          onClick={onToday}
          variant="outline"
          className="bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          order="ICON_FIRST"
        />

        <ToggleGroup 
          type="single" 
          value={view} 
          onValueChange={(v) => v && onViewChange(v as CalendarViewMode)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1"
        >
          <ToggleGroupItem value="month" className="text-xs px-3">{viewLabels.month}</ToggleGroupItem>
          <ToggleGroupItem value="week" className="text-xs px-3">{viewLabels.week}</ToggleGroupItem>
          <ToggleGroupItem value="year" className="text-xs px-3">{viewLabels.year}</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </header>
  );
}
