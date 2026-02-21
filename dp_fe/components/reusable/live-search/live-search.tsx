"use client";

import React from "react";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Command, CommandItem, CommandList, CommandEmpty } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CommandLoading } from "cmdk";
import SearchBar from "./search-bar";

interface LiveSearchProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  isLoading?: boolean;
  placeholder?: string;
  onSearch: (search: string) => void;
  selected: (
    value: { label: string | null; value: string | null; item?: any },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any
  ) => void;
  disabled?: boolean;
  labelKey: string;
  valueKey: string;
  defaultSelected?:
    | string
    | { label: string; value: string }
    | Record<string, any>;
  popoverTriggerClases?: string;
  popoverContentClasses?: string;
  isError?: boolean;
  mode?: "input" | "filter" | "table";
  multiple?: boolean;
  side?: "bottom" | "top" | "right" | "left";
  portalled?: boolean;
}

export default function LiveSearch({
  data,
  isLoading,
  placeholder,
  labelKey,
  valueKey,
  onSearch,
  selected,
  defaultSelected,
  popoverTriggerClases,
  popoverContentClasses,
  isError,
  mode,
  multiple,
  disabled,
  side,
  portalled,
}: LiveSearchProps) {
  const [open, setOpen] = React.useState(false);

  const [value, setValue] = React.useState<{
    label: string | null;
    value: string | null;
    item?: any;
  }>({ label: null, value: null });

  const [multiValue, setMultiValue] = React.useState<
    { label: string; value: string; item?: any }[]
  >([]);

  const renderMod = (m: "input" | "filter" | "table") => {
    if (m === "input") return "";
    if (m === "filter") return "h-[30px]";
  };

  React.useEffect(() => {
    if (!defaultSelected) {
       setValue({ label: null, value: null });
       setMultiValue([]);
       return;
    }
    
    if (multiple) {
      if (data.length === 0) return;
      let ids: string[] = [];

      if (Array.isArray(defaultSelected)) {
        ids = defaultSelected.map(String);
      } else if (
        typeof defaultSelected === "object" &&
        !("label" in defaultSelected) &&
        !("value" in defaultSelected)
      ) {
        return;
      } else if (typeof defaultSelected === "string") {
        ids = [defaultSelected];
      }

      if (ids.length === 0) return;

      const matched = data.filter((item) => ids.includes(item[valueKey]));
      if (matched.length === 0) return;

      const mv = matched.map((d) => ({
        value: d[valueKey],
        label: d[labelKey],
        item: d,
      }));

      setMultiValue(mv);
      return;
    }

    if (typeof defaultSelected === "object") {
      if ("label" in defaultSelected && "value" in defaultSelected) {
        setValue(
          defaultSelected as { label: string; value: string; item?: any }
        );
        return;
      }

      const val = (defaultSelected as any)[valueKey];
      const lab = (defaultSelected as any)[labelKey];

      if (val && lab) {
        const v = {
          value: val,
          label: lab,
          item: defaultSelected,
        };
        setValue(v);
        return;
      }
    }

    if (typeof defaultSelected === "string") {
      if (data.length === 0) return;
      const matched = data.find((item) => item[valueKey] === defaultSelected);
      if (matched) {
        const v = {
          value: matched[valueKey],
          label: matched[labelKey],
          item: matched,
        };
        setValue(v);
      }
    }
  }, [defaultSelected, data, labelKey, valueKey, multiple]);

  return (
    <Popover
      open={disabled ? false : open}
      onOpenChange={disabled ? undefined : setOpen}
    >
      <PopoverTrigger
        aria-invalid={isError}
        className={cn(
          "w-full aria-[invalid=true]:border-red-500",
          popoverTriggerClases,
          renderMod(mode ?? "input")
        )}
        asChild
      >
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full flex justify-between shadow-none dark:bg-black border rounded-sm border-slate-200",
            mode === "table" && "rounded-none border-0"
          )}
        >
          <div className="w-full text-ellipsis truncate text-left">
            {multiple
              ? multiValue.length > 0
                ? multiValue.map((v) => v.label).join(", ")
                : placeholder ?? "Select..."
              : value.label || (placeholder ?? "Select...")}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-full shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={side ?? "bottom"}
        className={cn(
          "max-w-[250px] p-0 pointer-events-auto",
          popoverContentClasses
        )}
      >
        <Command shouldFilter={false}>
          <SearchBar
            onSearch={onSearch}
            className="w-full rounded-none border-0 border-b outline-0 ring-0 focus-within:ring-0"
          />
          <CommandList>
            {isLoading && (
              <div className="w-full flex justify-center py-4">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            )}
            {!isLoading && data.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                No Data Found.
              </div>
            )}
            {mode === "filter" && (
              <CommandItem
                value="__all__"
                onSelect={() => {
                  if (multiple) {
                    setMultiValue([]);
                    selected({ label: null, value: null, item: {} }, []);
                    setOpen(false);
                  } else {
                    setValue({ label: null, value: null, item: {} });
                    selected({ label: null, value: null, item: {} }, "");
                    setOpen(false);
                  }
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    multiple
                      ? multiValue.length === 0
                        ? "opacity-100"
                        : "opacity-0"
                      : value.value === null
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                All
              </CommandItem>
            )}
            {!isLoading &&
              data.map((d) => (
                <CommandItem
                  key={d[valueKey]}
                  value={String(d[valueKey])}
                  onSelect={() => {
                    if (multiple) {
                      const exists = multiValue.find(
                        (v) => v.value === d[valueKey]
                      );
                      let updated: {
                        label: string;
                        value: string;
                        item?: any;
                      }[];

                      if (exists) {
                        updated = multiValue.filter(
                          (v) => v.value !== d[valueKey]
                        );
                      } else {
                        updated = [
                          ...multiValue,
                          { value: d[valueKey], label: d[labelKey], item: d },
                        ];
                      }

                      setMultiValue(updated);
                      selected(
                        { label: null, value: null, item: {} },
                        updated.map((i) => i.value)
                      );
                    } else {
                      const isSame = d[valueKey] === value.value;
                      const newVal = isSame
                        ? { label: null, value: null, item: {} }
                        : { value: d[valueKey], label: d[labelKey], item: d };

                      setValue(newVal);
                      selected(newVal, d);
                      setOpen(false);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      multiple
                        ? multiValue.find((v) => v.value === d[valueKey])
                          ? "opacity-100"
                          : "opacity-0"
                        : value.value === d[valueKey]
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {d[labelKey]}
                </CommandItem>
              ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
