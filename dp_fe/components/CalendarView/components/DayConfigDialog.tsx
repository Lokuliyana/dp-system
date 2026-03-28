import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MultiSelect } from "@/components/ui/multi-select";

interface DayConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    date: Date;
    endDate?: Date;
    isHoliday: boolean;
    holidayType: 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None' | 'SpecialEvent' | 'SpecialDay' | 'Competition';
    label: string;
    isMultiDay: boolean;
    descriptionEn?: string;
    teacherInChargeId?: string;
    gradeIds?: string[];
    competitionIds?: string[];
  }) => void;
  selectedDate: Date | null;
  initialConfig?: {
    isHoliday: boolean;
    holidayType: 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None' | 'SpecialEvent' | 'SpecialDay' | 'Competition';
    label: string;
    descriptionEn?: string;
    metadata?: any;
  };
}

export function DayConfigDialog({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  initialConfig,
}: DayConfigDialogProps) {
  const [formData, setFormData] = useState({
    date: selectedDate || new Date(),
    endDate: undefined as Date | undefined,
    isHoliday: false,
    holidayType: 'None' as 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None' | 'SpecialEvent' | 'SpecialDay' | 'Competition',
    label: '',
    isMultiDay: false,
    descriptionEn: '',
    teacherInChargeId: '',
    gradeIds: [] as string[],
    competitionIds: [] as string[],
    startTime: '',
    endTime: '',
  });

  const [competitions, setCompetitions] = useState<any[]>([]);

  useEffect(() => {
    import("@/services/masterdata/competitions.service").then(({ competitionsService }) => {
      competitionsService.list().then(setCompetitions);
    });
  }, []);

  useEffect(() => {
    if (isOpen && selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const scheduledCompIds = initialConfig?.metadata?.allDayEvents
        ?.filter((e: any) => (e.type === 'competition-event'))
        ?.map((e: any) => e.metadata?.competitionId)
        ?.filter(Boolean) || [];

      setFormData({
        date: selectedDate,
        endDate: undefined,
        isHoliday: initialConfig?.isHoliday ?? isWeekend,
        holidayType: initialConfig?.holidayType ?? (isWeekend ? 'Weekend' : 'None'),
        label: initialConfig?.label ?? '',
        isMultiDay: false,
        descriptionEn: initialConfig?.descriptionEn ?? '',
        teacherInChargeId: initialConfig?.metadata?.teacherInChargeId || '',
        gradeIds: initialConfig?.metadata?.gradeIds || [],
        competitionIds: scheduledCompIds,
        startTime: (initialConfig as any)?.startTime || '',
        endTime: (initialConfig as any)?.endTime || '',
      });
    }
  }, [isOpen, selectedDate, initialConfig]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isHolidayRequiredLabel = formData.isHoliday && formData.holidayType !== 'Weekend' && !formData.label.trim();
  const isSpecialEvent = formData.holidayType === 'SpecialEvent';
  const isSpecialDay = formData.holidayType === 'SpecialDay';
  const isCompetition = formData.holidayType === 'Competition';

  const competitionOptions = competitions.map(c => ({
    label: c.nameEn,
    value: c.id || c._id
  }));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {isSpecialEvent ? 'Create School Event' : 
                 isCompetition ? 'Schedule Competitions' : 
                 isSpecialDay ? 'Plan Special Day' : 'Configure Schedule'}
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Multi-day Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-900">
            <div className="space-y-0.5">
              <Label htmlFor="isMultiDay" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">Multi-day Range</Label>
              <p className="text-[11px] text-slate-500">Apply configuration to multiple dates</p>
            </div>
            <Checkbox 
              id="isMultiDay" 
              checked={formData.isMultiDay}
              onCheckedChange={(checked) => setFormData({ ...formData, isMultiDay: !!checked })}
              className="h-5 w-5 rounded border-slate-300"
            />
          </div>

          {/* Date Selection for Multi-day */}
          <AnimatePresence>
            {formData.isMultiDay && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 overflow-hidden"
              >
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-9 justify-start text-xs font-medium rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        {format(formData.date, 'MMM d, yyyy')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-md shadow-lg border-slate-200 dark:border-slate-800" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-9 justify-start text-xs font-medium rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                        {formData.endDate ? format(formData.endDate, 'MMM d, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-md shadow-lg border-slate-200 dark:border-slate-800" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.endDate}
                        onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                        disabled={(date) => date < formData.date}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Configuration Type Selector */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'None', label: 'Normal' },
                  { id: 'OrganizationalHoliday', label: 'Holiday' },
                  { id: 'SpecialDay', label: 'Special Day' },
                  { id: 'SpecialEvent', label: 'Event' },
                  { id: 'Competition', label: 'Competition' },
                  { id: 'PublicHoliday', label: 'Public' }
                ].map((type) => (
                  <Button
                    key={type.id}
                    variant={formData.holidayType === type.id ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-[10px] font-medium px-1"
                    onClick={() => setFormData({ 
                      ...formData, 
                      holidayType: type.id as any,
                      isHoliday: type.id === 'OrganizationalHoliday' || type.id === 'PublicHoliday'
                    })}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Common Label/Title */}
            {!isCompetition && (
              <div className="space-y-1.5">
                <Label htmlFor="label" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {isSpecialEvent ? 'Event Title' : 'Label / Description'}
                </Label>
                <Input 
                  id="label" 
                  placeholder={isSpecialEvent ? "e.g. Annual Sports Meet" : "e.g. Independence Day"}
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className={cn(
                    "h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm shadow-sm transition-all",
                    isHolidayRequiredLabel ? "border-rose-300 focus:ring-rose-500/10" : "focus:ring-primary/10"
                  )}
                />
              </div>
            )}

            {/* Special Event / Special Day / Competition Extra Fields */}
            {(isSpecialEvent || isSpecialDay || isCompetition) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800"
              >
                {/* Time Inputs for Event and Competition */}
                {(isSpecialEvent || isCompetition) && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="startTime" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Start Time</Label>
                      <Input 
                        id="startTime" 
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="h-9 rounded-md text-xs shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="endTime" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">End Time</Label>
                      <Input 
                        id="endTime" 
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="h-9 rounded-md text-xs shadow-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Description for Event and Special Day */}
                {(isSpecialEvent || isSpecialDay) && (
                  <div className="space-y-1.5">
                    <Label htmlFor="descriptionEn" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Description</Label>
                    <Textarea 
                      id="descriptionEn" 
                      placeholder={isSpecialDay ? "Details about this special day..." : "Event details..."}
                      value={formData.descriptionEn}
                      onChange={(e: any) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      className="min-h-[80px] rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm shadow-sm"
                    />
                  </div>
                )}

                {/* Competition Multi-Selector */}
                {isCompetition && (
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Select Competitions</Label>
                    <MultiSelect
                      options={competitionOptions}
                      value={formData.competitionIds}
                      onValueChange={(val) => setFormData({ ...formData, competitionIds: val })}
                      placeholder="Pick competitions to schedule..."
                    />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-9 rounded-md text-xs font-semibold text-slate-600 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isHolidayRequiredLabel || (isCompetition && formData.competitionIds.length === 0)}
            className="flex-1 h-9 rounded-md text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
          >
            {isSpecialEvent ? 'Create Event' : isCompetition ? 'Schedule All' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
