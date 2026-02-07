"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ImagePicker } from "@/components/reusable/image-picker"
import { supabase } from "@/lib/supabase"
import { studentsService } from "@/services/students.service"
import { toast } from "sonner"
import { User, Camera } from "lucide-react"

interface StudentAvatarProps {
  studentId: string
  photoUrl?: string
  firstName: string
  lastName: string
  onUpdate: (photoUrl: string) => void
}

export function StudentAvatar({ studentId, photoUrl, firstName, lastName, onUpdate }: StudentAvatarProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(photoUrl)

  // Keep local state in sync with prop for initial load or external updates
  useEffect(() => {
    setCurrentPhotoUrl(photoUrl)
  }, [photoUrl])

  const handleImageSelected = async (blob: Blob) => {
    setIsUploading(true)
    if (!studentId) {
      toast.error("Internal Error: Student ID is missing")
      setIsUploading(false)
      return
    }

    const fileExt = "jpg"
    const fileName = `${studentId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    try {
      console.log("Uploading to Supabase bucket 'student-photos' path:", filePath)
      // 1. Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from("student-photos")
        .upload(filePath, blob, {
          cacheControl: "3600",
          upsert: true,
        })

      if (uploadError) {
        if (uploadError.message === "Bucket not found") {
          throw new Error("Supabase bucket 'student-photos' not found. Please create it in your Supabase dashboard.")
        }
        throw uploadError
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("student-photos")
        .getPublicUrl(filePath)

      // 3. Update backend database
      await studentsService.update(studentId, { photoUrl: publicUrl })

      setCurrentPhotoUrl(publicUrl)
      onUpdate(publicUrl)
      toast.success("Profile photo updated successfully")
    } catch (error: any) {
      console.error("Error updating photo:", error)
      toast.error(`Failed to update photo: ${error.message || "Unknown error"}`)
    } finally {
      setIsUploading(false)
    }
  }

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`

  return (
    <div className="relative inline-block group">
      <div className="relative p-1 rounded-full bg-gradient-to-tr from-slate-200 to-slate-50 shadow-sm group-hover:shadow-md transition-shadow duration-300">
        <button
          type="button"
          onClick={() => {
            console.log("Avatar clicked for student:", studentId)
            setIsPickerOpen(true)
          }}
          className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 overflow-hidden"
          aria-label="Change profile photo"
        >
          <Avatar className="h-24 w-24 border-2 border-white">
            <AvatarImage src={currentPhotoUrl} className="object-cover" />
            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-2xl">
              {initials || <User className="h-12 w-12" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Camera className="h-6 w-6 text-white mb-1" />
            <span className="text-[10px] font-medium text-white uppercase tracking-wider">Change</span>
          </div>

          {isUploading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 transition-opacity duration-300">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase">Updating...</span>
              </div>
            </div>
          )}
        </button>
      </div>

      <ImagePicker 
        isOpen={isPickerOpen} 
        onClose={() => setIsPickerOpen(false)} 
        onImageSelected={handleImageSelected} 
      />
    </div>
  )
}
