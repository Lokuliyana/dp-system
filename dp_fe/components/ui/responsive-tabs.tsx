"use client";

import * as React from "react";
import { MoreHorizontal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui";

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ElementType;
}

interface ResponsiveTabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ResponsiveTabs({
  items,
  value,
  onValueChange,
  className,
}: ResponsiveTabsProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = React.useState(items.length);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const updateVisibleCount = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const moreButtonWidth = 50;
      const averageTabWidth = 140; // Increased slightly to be safe
      
      if (containerWidth === 0) return;

      const maxVisible = Math.floor((containerWidth - moreButtonWidth) / averageTabWidth);
      // Ensure at least 1 item is visible if possible, but if very small, maybe just dropdown?
      // Let's stick to at least 1 for now, unless width is really small.
      // If width < averageTabWidth + moreButtonWidth, maybe just show dropdown?
      
      if (containerWidth < averageTabWidth) {
         setVisibleCount(0); // Show only dropdown
      } else {
         setVisibleCount(Math.max(1, Math.min(items.length, maxVisible)));
      }
    };

    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(containerRef.current);
    
    // Initial check
    updateVisibleCount();

    return () => observer.disconnect();
  }, [items.length]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <div ref={containerRef} className={cn("flex items-center gap-2 w-full", className)}>
      {visibleItems.map((item) => (
        <Button
          key={item.value}
          variant={value === item.value ? "default" : "outline"}
          size="sm"
          onClick={() => onValueChange(item.value)}
          className={cn(
            "whitespace-nowrap transition-all flex-shrink-0",
            value === item.value
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "text-slate-600 hover:text-slate-900"
          )}
        >
          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
          {item.label}
        </Button>
      ))}

      {overflowItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="px-2 flex-shrink-0 ml-auto">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {overflowItems.map((item) => (
              <DropdownMenuItem
                key={item.value}
                onClick={() => onValueChange(item.value)}
                className="flex items-center justify-between"
              >
                <span className="flex items-center">
                  {item.icon && <item.icon className="mr-2 h-4 w-4 text-slate-500" />}
                  {item.label}
                </span>
                {value === item.value && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
