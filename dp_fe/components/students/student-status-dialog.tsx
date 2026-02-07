"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, UserCheck, UserX } from "lucide-react"
import { cn } from "@/lib/utils"

interface StudentStatusDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (note: string) => void
  targetStatus: "active" | "inactive"
}

export function StudentStatusDialog({
  isOpen,
  onClose,
  onConfirm,
  targetStatus,
}: StudentStatusDialogProps) {
  const [note, setNote] = useState("")
  const [error, setError] = useState(false)

  const handleConfirm = () => {
    if (!note.trim()) {
      setError(true)
      return
    }
    onConfirm(note)
    setNote("")
    setError(false)
  }

  const handleClose = () => {
    setNote("")
    setError(false)
    onClose()
  }

  const isActive = targetStatus === "active"

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl">
        <div className={cn(
          "px-6 py-6 border-b flex items-center gap-4",
          isActive ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"
        )}>
          <div className={cn(
            "p-3 rounded-full shadow-sm",
            isActive ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          )}>
            {isActive ? <UserCheck className="h-6 w-6" /> : <UserX className="h-6 w-6" />}
          </div>
          <div>
            <DialogTitle className="text-slate-900 text-lg">
              {isActive ? "Activate Student Account" : "Deactivate Student Account"}
            </DialogTitle>
            <DialogDescription className="text-slate-500 text-xs mt-0.5">
              Updates will be logged in the student&apos;s history.
            </DialogDescription>
          </div>
        </div>

        <div className="px-6 py-6 space-y-4 bg-white">
          <div className="space-y-3">
            <Label 
              htmlFor="status-note" 
              className={cn(
                "text-[10px] font-bold uppercase tracking-wider",
                error ? "text-red-600" : "text-slate-500"
              )}
            >
              Reason For Status Change <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="status-note"
              placeholder={isActive 
                ? "Briefly describe the reason for reactivation (e.g., Returns from leave)" 
                : "Briefly describe the reason for deactivation (e.g., Transfer to another school)"
              }
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                if (e.target.value.trim()) setError(false)
              }}
              className={cn(
                "min-h-[100px] bg-slate-50 border-slate-200 focus-visible:ring-offset-0 placeholder:text-slate-400 italic text-sm",
                error && "border-red-500 focus-visible:ring-red-100"
              )}
            />
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 animate-in fade-in slide-in-from-left-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <p className="text-[11px] font-medium">A note is required to change student status.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 gap-3 sm:gap-0">
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="text-slate-600 hover:bg-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className={cn(
              "shadow-md px-8",
              isActive ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
            )}
          >
            {isActive ? "Confirm Activation" : "Confirm Deactivation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
