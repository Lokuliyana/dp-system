"use client"

import { UserManagementForm } from "@/components/users/user-management-form"
import { LayoutController } from "@/components/layout/dynamic"
import { useAppUser } from "@/hooks/useAuth"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EditUserPage() {
  const params = useParams()
  const id = params.id as string
  const { data: user, isLoading } = useAppUser(id)

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <div className="p-4 sm:p-8">
        {isLoading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UserManagementForm initialData={user} isEditing={true} />
        )}
      </div>
    </LayoutController>
  )
}
