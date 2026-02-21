"use client";

import React, { useState } from "react";
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const EXPORT_FIELDS = [
  { id: "academicYear", label: "Year" },
  { id: "admissionNumber", label: "ඇතුළත් වීමේ අංකය" },
  { id: "nameWithInitialsSi", label: "මුලකුරු සහිත නම" },
  { id: "gradeSearchName", label: "ශ් (Grade)" },
  { id: "status", label: "Register (Present: 1/0)" },
  { id: "fullNameSi", label: "සම්පූර්ණ නම" },
  { id: "firstNameSi", label: "මුල් නම" },
  { id: "lastNameSi", label: "වාසගම" },
  { id: "fullNameEn", label: "Full Name" },
  { id: "dob", label: "උපන් දිනය" },
  { id: "sex", label: "ස්ත්‍රී පුරුෂ භාවය" },
  { id: "birthCertificateNumber", label: "උප්පැන්න සහතික අංකය" },
  { id: "admissionDate", label: "ඇතුළත් වීමේ දිනය" },
  { id: "admittedGrade", label: "ඇතුළත් ශ්" },
  { id: "addressSi", label: "ලිපිනය" },
  { id: "whatsappNumber", label: "whatapp දුරකතන අංකය" },
  { id: "emergencyNumber", label: "හදිසියකදි දැනුම් දිය යුතු අංකය" },
  { id: "email", label: "විද්‍යුත් තැපෑල" },
  { id: "medium", label: "මාධ්‍ය" },
  { id: "motherNameEn", label: "මවගේ නම" },
  { id: "motherNumber", label: "මවගේ දුරකතන අංකය" },
  { id: "motherOccupation", label: "මවගේ රැකියාව" },
  { id: "fatherNameEn", label: "පියාගේ නම" },
  { id: "fatherNumber", label: "පියාගේ දුරකතන අංකය" },
  { id: "fatherOccupation", label: "පියාගේ රැකියාව" },
  { id: "guardianName", label: "භාරකරුගේ නම" },
  { id: "guardianNumber", label: "භාරකරුගේ දුරකතන අංකය" },
  { id: "guardianOccupation", label: "භාරකරුගේ රැකියාව" },
];

interface StudentExportDialogProps {
  endpoint: string;
  filename?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function StudentExportDialog({
  endpoint,
  filename = "student_export",
  variant = "outline",
  size = "sm",
  className = "",
}: StudentExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  
  // By default all fields selected
  const [selectedFields, setSelectedFields] = useState<string[]>(
    EXPORT_FIELDS.map((f) => f.id)
  );

  const toggleField = (id: string) => {
    setSelectedFields((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleExport = async (format: "pdf" | "xlsx") => {
    if (selectedFields.length === 0) {
      toast.error("Please select at least one field to export.");
      return;
    }

    const setLoading = format === "pdf" ? setLoadingPdf : setLoadingExcel;
    setLoading(true);
    const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);

    try {
      const fieldsQuery = selectedFields.join(",");
      const response = await axiosInstance.get(
        `${endpoint}?format=${format}&fields=${fieldsQuery}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${filename}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Export completed successfully", { id: toastId });
      setOpen(false); // Close dialog on success
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Export failed. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Export Students</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden pr-2">
          <div className="text-sm text-muted-foreground mb-4">
            Select the fields you want to include in the export file.
          </div>
          
          <div className="flex justify-between items-center mb-4">
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFields(EXPORT_FIELDS.map(f => f.id))}
             >
                Select All
             </Button>
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedFields([])}
             >
                Deselect All
             </Button>
          </div>

          <ScrollArea className="h-[calc(100%-4rem)] border rounded-md p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXPORT_FIELDS.map((field) => (
                <div key={field.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={selectedFields.includes(field.id)}
                    onCheckedChange={() => toggleField(field.id)}
                  />
                  <label
                    htmlFor={`field-${field.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={loadingPdf || loadingExcel}
          >
            {loadingPdf ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Export PDF
          </Button>
          <Button
            onClick={() => handleExport("xlsx")}
            disabled={loadingPdf || loadingExcel}
          >
            {loadingExcel ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Export Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
