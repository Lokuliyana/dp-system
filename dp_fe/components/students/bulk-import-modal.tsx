import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useBulkImportStudents } from "@/hooks/useStudents";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BulkImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ success: number; failed: number; errors: any[] } | null>(null);
  
  const { mutate: importStudents, isPending } = useBulkImportStudents();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    importStudents(file, {
      onSuccess: (data) => {
        setResult(data);
        setFile(null);
      },
    });
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && reset()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-sm gap-2 px-3" onClick={() => setIsOpen(true)}>
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Import Students</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file to import students. Existing admission numbers will be updated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!result && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">XLSX, CSV (max 10MB)</p>
              </div>
              <Input
                type="file"
                accept=".csv, .xlsx, .xls"
                className="max-w-xs"
                onChange={handleFileChange}
              />
            </div>
          )}

          {isPending && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Processing file...</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">Successfully Imported</p>
                    <p className="text-2xl font-bold text-green-700">{result.success}</p>
                  </div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-900">Failed Records</p>
                    <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                  </div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="border rounded-md">
                  <div className="p-3 bg-muted/50 border-b">
                    <h4 className="text-sm font-medium">Error Details</h4>
                  </div>
                  <ScrollArea className="h-[200px]">
                    <div className="p-4 space-y-3">
                      {result.errors.map((err, i) => (
                        <div key={i} className="text-sm border-b last:border-0 pb-2 last:pb-0">
                          <span className="font-medium text-red-600">Row {err.row}: </span>
                          <span className="text-muted-foreground">{err.error}</span>
                          {err.admissionNumber && (
                            <span className="text-xs text-slate-500 block mt-1">
                              Admission No: {err.admissionNumber}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
              
              <Button onClick={reset} className="w-full">Upload Another File</Button>
            </div>
          )}
        </div>

        {!result && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={!file || isPending}>
              {isPending ? "Uploading..." : "Upload"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
