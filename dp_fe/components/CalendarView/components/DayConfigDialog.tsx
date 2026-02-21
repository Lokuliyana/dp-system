import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DayConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    date: Date;
    endDate?: Date;
    isWorking: boolean;
    isHoliday: boolean;
    holidayType: 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None';
    label: string;
    startTime: string;
    endTime: string;
    isMultiDay: boolean;
  }) => void;
  selectedDate: Date | null;
  initialConfig?: {
    isWorking: boolean;
    isHoliday: boolean;
    holidayType: 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None';
    label: string;
    startTime: string;
    endTime: string;
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
    isWorking: true,
    isHoliday: false,
    holidayType: 'None' as 'PublicHoliday' | 'OrganizationalHoliday' | 'Weekend' | 'None',
    label: '',
    startTime: '08:00',
    endTime: '17:00',
    isMultiDay: false,
  });

  useEffect(() => {
    if (isOpen && selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      setFormData({
        date: selectedDate,
        endDate: undefined,
        isWorking: initialConfig?.isWorking ?? !isWeekend,
        isHoliday: initialConfig?.isHoliday ?? isWeekend,
        holidayType: initialConfig?.holidayType ?? (isWeekend ? 'Weekend' : 'None'),
        label: initialConfig?.label ?? '',
        startTime: initialConfig?.startTime ?? '08:00',
        endTime: initialConfig?.endTime ?? '17:00',
        isMultiDay: false,
      });
    }
  }, [isOpen, selectedDate, initialConfig]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const isHolidayRequiredLabel = formData.isHoliday && formData.holidayType !== 'Weekend' && !formData.label.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-xl rounded-lg">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Configure Schedule
              </DialogTitle>
              <p className="text-xs text-slate-500 font-medium">
                {selectedDate && format(selectedDate, 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-5">
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

          {/* Holiday Toggle */}
          <div className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-900">
            <div className="space-y-0.5">
              <Label htmlFor="isHoliday" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">Mark as Holiday</Label>
              <p className="text-[11px] text-slate-500">Public or Company Holiday</p>
            </div>
            <Checkbox 
              id="isHoliday" 
              checked={formData.isHoliday}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isHoliday: !!checked, 
                isWorking: !checked,
                holidayType: checked ? 'OrganizationalHoliday' : 'None'
              })}
              className="h-5 w-5 rounded border-slate-300 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
            />
          </div>

          {/* Label / Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="label" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Label / Description</Label>
              {formData.isHoliday && formData.holidayType !== 'Weekend' && <span className="text-[10px] font-medium text-amber-600">Required for holidays</span>}
            </div>
            <Input 
              id="label" 
              placeholder={formData.isHoliday ? "e.g. Independence Day" : "e.g. Normal Working Day"}
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className={cn(
                "h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm shadow-sm transition-all",
                isHolidayRequiredLabel ? "border-rose-300 focus:ring-rose-500/10" : "focus:ring-primary/10"
              )}
            />
          </div>

          {/* Workable Toggle (Only if Holiday) */}
          <AnimatePresence>
            {formData.isHoliday && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex items-center justify-between py-2 px-3 rounded-md bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="space-y-0.5">
                  <Label htmlFor="isWorking" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">Is Workable?</Label>
                  <p className="text-[10px] text-slate-500">Enable business hours for this holiday</p>
                </div>
                <Checkbox 
                  id="isWorking" 
                  checked={formData.isWorking}
                  onCheckedChange={(checked) => setFormData({ ...formData, isWorking: !!checked })}
                  className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Working Hours */}
          <AnimatePresence>
            {formData.isWorking && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="space-y-3 pt-1"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <Label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Business Hours</Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="startTime" className="text-[10px] font-medium text-slate-400 uppercase">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium shadow-sm focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="endTime" className="text-[10px] font-medium text-slate-400 uppercase">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="h-9 rounded-md border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm font-medium shadow-sm focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            disabled={isHolidayRequiredLabel}
            className="flex-1 h-9 rounded-md text-xs font-semibold bg-primary hover:bg-primary/90 text-white shadow-sm transition-all"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
