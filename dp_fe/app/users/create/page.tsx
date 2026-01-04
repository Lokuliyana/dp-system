"use client"

import { UserManagementForm } from "@/components/users/user-management-form"
import { LayoutController } from "@/components/layout/dynamic"

export default function CreateUserPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <div className="p-4 sm:p-8">
        <UserManagementForm isEditing={false} />
      </div>
    </LayoutController>
  )
}
