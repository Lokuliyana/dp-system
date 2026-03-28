"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Label
} from "@/components/ui";
import { schoolService, AttendanceConfig } from "@/services/school.service";
import { Loader2, Save, CalendarClock } from "lucide-react";

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AttendanceConfigPanel() {
  const [config, setConfig] = useState<AttendanceConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await schoolService.getAttendanceConfig();
        setConfig(data);
      } catch (error) {
        console.error("Failed to fetch attendance config:", error);
        toast.error("Failed to load attendance configuration");
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    try {
      setSaving(true);
      await schoolService.updateAttendanceConfig(config);
      toast.success("Attendance configuration updated successfully");
    } catch (error) {
      console.error("Failed to update attendance config:", error);
      toast.error("Failed to update attendance configuration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) return null;

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Attendance Marking Window</CardTitle>
            <CardDescription>
              Configure when attendance can be marked globally for the school.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dayOfWeek">Regular Marking Day</Label>
            <Select 
              value={config.allowedDayOfWeek.toString()} 
              onValueChange={(v) => setConfig({ ...config, allowedDayOfWeek: parseInt(v) })}
            >
              <SelectTrigger id="dayOfWeek">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              Users will only be able to mark attendance on this day of the week.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input 
              id="startTime" 
              type="time" 
              value={config.startTime} 
              onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
            />
            <p className="text-xs text-slate-500">
              Attendance marking opens at this time.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">End Time</Label>
            <Input 
              id="endTime" 
              type="time" 
              value={config.endTime} 
              onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
            />
            <p className="text-xs text-slate-500">
              Attendance marking closes at this time.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
