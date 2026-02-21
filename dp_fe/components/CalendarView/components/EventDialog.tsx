import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarPlus, CalendarRange, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarEvent, EventFormData } from '../types';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onUpdate?: (eventId: string, event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: (eventId: string) => void;
  selectedDate: Date | null;
  editEvent?: CalendarEvent | null;
  entityName?: string;
}

export function EventDialog({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  selectedDate,
  editEvent,
  entityName = 'Event',
}: EventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    type: entityName === 'Holiday' ? 'holiday' : 'event',
    startDate: selectedDate || new Date(),
    endDate: undefined,
    description: '',
    isMultiDay: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editEvent) {
      setFormData({
        title: editEvent.title,
        type: editEvent.type,
        startDate: new Date(editEvent.startDate),
        endDate: editEvent.endDate ? new Date(editEvent.endDate) : undefined,
        description: editEvent.description || '',
        isMultiDay: !!editEvent.isMultiDay,
      });
    } else if (selectedDate) {
      setFormData({
        title: '',
        type: entityName === 'Holiday' ? 'holiday' : 'event',
        startDate: selectedDate,
        endDate: undefined,
        description: '',
        isMultiDay: false,
      });
    }
  }, [editEvent, selectedDate, isOpen, entityName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const event: Omit<CalendarEvent, 'id'> = {
      title: formData.title,
      type: formData.type,
      startDate: format(formData.startDate, 'yyyy-MM-dd'),
      endDate: formData.isMultiDay && formData.endDate ? format(formData.endDate, 'yyyy-MM-dd') : undefined,
      description: formData.description,
      isMultiDay: formData.isMultiDay,
    };

    if (editEvent && onUpdate) {
      onUpdate(editEvent.id, event);
    } else {
      onSave(event);
    }
    onClose();
  };

  const handleDelete = () => {
    if (editEvent && onDelete) {
      onDelete(editEvent.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/10">
                    {formData.isMultiDay ? (
                      <CalendarRange className="h-5 w-5 text-primary" />
                    ) : (
                      <CalendarPlus className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {editEvent ? `Edit ${entityName}` : `New ${entityName}`}
                    </DialogTitle>
                    <DialogDescription className="text-[13px] text-slate-500 font-medium">
                      {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </DialogDescription>
                  </div>
                </div>
                {editEvent && onDelete && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-9 w-9 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </Button>
                )}
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {entityName} Title
                </Label>
                <Input
                  id="title"
                  placeholder="What's the plan?"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  autoFocus
                  required
                />
              </div>


              {/* Multi-day Toggle */}
              <div className="flex items-center justify-between py-3.5 px-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                    <CalendarRange className="h-4 w-4 text-slate-500" />
                  </div>
                  <Label htmlFor="multiday" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Multi-day event
                  </Label>
                </div>
                <input
                  type="checkbox"
                  id="multiday"
                  checked={formData.isMultiDay}
                  onChange={(e) => setFormData({ ...formData, isMultiDay: e.target.checked })}
                  className="h-5 w-5 rounded-md border-slate-300 text-primary focus:ring-primary/20 cursor-pointer transition-all"
                />
              </div>

              {/* Date Selection */}
              <AnimatePresence>
                {formData.isMultiDay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-4 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <Label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-11 justify-start text-left font-semibold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            {format(formData.startDate, 'MMM d, yyyy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate}
                            onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full h-11 justify-start text-left font-semibold rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            {formData.endDate ? format(formData.endDate, 'MMM d, yyyy') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-2xl shadow-2xl border-slate-200 dark:border-slate-800" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate}
                            onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                            disabled={(date) => date < formData.startDate}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[13px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Description <span className="text-slate-400 font-medium lowercase">(optional)</span>
                </Label>
                <textarea
                  id="description"
                  placeholder="Add some details about this event..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/20 transition-all resize-none min-h-[100px] text-slate-700 dark:text-slate-300"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={onClose}
                  className="h-11 px-6 rounded-xl font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!formData.title.trim()}
                  className="h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                  {editEvent ? 'Save Changes' : `Create ${entityName}`}
                </Button>
              </div>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                <AlertTriangle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Delete {entityName}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 font-medium">
                  This action cannot be undone.
                </DialogDescription>
              </div>
            </div>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-slate-100">&quot;{editEvent?.title}&quot;</span>?
            </p>
          </div>
          <DialogFooter className="p-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 h-11 rounded-xl font-bold text-slate-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              className="flex-1 h-11 rounded-xl font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
