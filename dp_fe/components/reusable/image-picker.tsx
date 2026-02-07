"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Camera, Upload, X, RefreshCw, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePickerProps {
  isOpen: boolean
  onClose: () => void
  onImageSelected: (blob: Blob) => void
}

export function ImagePicker({ isOpen, onClose, onImageSelected }: ImagePickerProps) {
  const [mode, setMode] = useState<"initial" | "camera" | "preview">("initial")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  const startCamera = async () => {
    setCameraError(null)
    setMode("camera")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user" 
        } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err)
      setCameraError("Could not access camera. Please check permissions.")
      setMode("initial")
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  const capturePhoto = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement("canvas")
      
      // We want a square crop for avatars
      const size = Math.min(video.videoWidth, video.videoHeight)
      canvas.width = size
      canvas.height = size
      
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Center crop
        const startX = (video.videoWidth - size) / 2
        const startY = (video.videoHeight - size) / 2
        
        ctx.drawImage(
          video,
          startX, startY, size, size, // Source
          0, 0, size, size            // Destination
        )
        
        canvas.toBlob((blob) => {
          if (blob) {
            setCapturedBlob(blob)
            const url = URL.createObjectURL(blob)
            setPreviewUrl(url)
            setMode("preview")
            stopCamera()
          }
        }, "image/jpeg", 0.9)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        return
      }
      
      setCapturedBlob(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setMode("preview")
    }
  }

  const handleSave = () => {
    if (capturedBlob) {
      onImageSelected(capturedBlob)
      handleClose()
    }
  }

  const handleClose = () => {
    stopCamera()
    setMode("initial")
    setPreviewUrl(null)
    setCapturedBlob(null)
    setCameraError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
          <div>
            <DialogTitle className="text-white text-lg font-semibold">Update Profile Photo</DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Take a photo or upload an image for the student record
            </DialogDescription>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="bg-slate-50 min-h-[360px] flex flex-col items-center justify-center relative">
          {mode === "initial" && (
            <div className="w-full h-full p-8 flex flex-col gap-6">
              {cameraError && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{cameraError}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={startCamera}
                  className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Camera className="h-8 w-8" />
                  </div>
                  <span className="font-semibold text-slate-900">Take Photo</span>
                  <span className="text-xs text-slate-500 mt-1">Use your camera</span>
                </button>
                
                <label className="group flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md cursor-pointer transition-all duration-200">
                  <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Upload className="h-8 w-8" />
                  </div>
                  <span className="font-semibold text-slate-900">Upload File</span>
                  <span className="text-xs text-slate-500 mt-1">Select from computer</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileUpload} 
                  />
                </label>
              </div>
              
              <div className="mt-auto pt-6 text-center">
                <p className="text-xs text-slate-400 max-w-[280px] mx-auto">
                  For best results, use a clear photo with good lighting and the face centered.
                </p>
              </div>
            </div>
          )}

          {mode === "camera" && (
            <div className="w-full h-full flex flex-col">
              <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  className="w-full h-full object-cover opacity-80" 
                />
                
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-64 h-64 rounded-full border-2 border-dashed border-white/50 relative shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                    <div className="absolute inset-0 border-2 border-white rounded-full animate-pulse opacity-20"></div>
                  </div>
                </div>
                
                <div className="absolute top-4 left-0 right-0 text-center">
                  <span className="bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full border border-white/20">
                    Position face in the circle
                  </span>
                </div>
              </div>
              
              <div className="bg-white p-6 border-t border-slate-200 flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => { stopCamera(); setMode("initial"); }}
                  className="text-slate-600"
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                
                <button 
                  onClick={capturePhoto}
                  className="h-16 w-16 rounded-full border-4 border-slate-200 flex items-center justify-center group active:scale-95 transition-transform shrink-0 translate-y-[-50%]"
                >
                  <div className="h-12 w-12 rounded-full bg-red-500 group-hover:bg-red-600 transition-colors shadow-lg"></div>
                </button>
                
                <div className="w-[80px]"></div> {/* Spacer */}
              </div>
            </div>
          )}

          {mode === "preview" && previewUrl && (
            <div className="w-full h-full flex flex-col p-8">
              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <div className="relative h-48 w-48 rounded-full border-4 border-white shadow-2xl overflow-hidden group">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                </div>
                
                <div className="text-center">
                  <h4 className="font-semibold text-slate-900">Looking good!</h4>
                  <p className="text-sm text-slate-500">How does this look for the profile?</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setMode("initial")
                    setPreviewUrl(null)
                    setCapturedBlob(null)
                  }}
                  className="flex-1 border-slate-300"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                </Button>
                <Button 
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md"
                >
                  <Check className="mr-2 h-4 w-4" /> Use Photo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
