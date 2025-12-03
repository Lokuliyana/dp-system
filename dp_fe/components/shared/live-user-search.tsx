"use client"

import { useState, useMemo } from "react"
import { X, Search, Check } from "lucide-react"
import { Input } from "@/components/ui"

export interface SearchableUser {
  id: string
  firstName: string
  lastName: string
  email?: string
  gradeId?: string
  rollNumber?: number
  type?: "student" | "teacher"
}

interface LiveUserSearchProps {
  users: SearchableUser[]
  selectedUsers: SearchableUser[]
  onSelect: (user: SearchableUser) => void
  onRemove: (userId: string) => void
  placeholder?: string
  maxSelections?: number
  userType?: "all" | "student" | "teacher"
}

export function LiveUserSearch({
  users,
  selectedUsers,
  onSelect,
  onRemove,
  placeholder = "Search users...",
  maxSelections,
  userType = "all",
}: LiveUserSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return []

    const term = searchTerm.toLowerCase()
    const selectedIds = selectedUsers.map((u) => u.id)

    return users
      .filter((user) => {
        if (selectedIds.includes(user.id)) return false
        if (userType !== "all" && user.type !== userType) return false

        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
        const email = user.email?.toLowerCase() || ""
        return fullName.includes(term) || email.includes(term)
      })
      .slice(0, 10)
  }, [searchTerm, users, selectedUsers, userType])

  const handleSelect = (user: SearchableUser) => {
    if (maxSelections && selectedUsers.length >= maxSelections) return
    onSelect(user)
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400 absolute left-3" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setIsOpen(true)
            }}
            onFocus={() => setIsOpen(true)}
            className="pl-9"
          />
        </div>

        {isOpen && filteredUsers.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.email && <p className="text-xs text-slate-600">{user.email}</p>}
                    {user.gradeId && (
                      <p className="text-xs text-slate-600">
                        {user.gradeId.replace("grade-", "Grade ")}
                        {user.rollNumber && ` • Roll ${user.rollNumber}`}
                      </p>
                    )}
                  </div>
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-600">
            Selected: {selectedUsers.length}
            {maxSelections && `/${maxSelections}`}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-blue-50 border border-blue-200 rounded-full px-3 py-1 flex items-center gap-2"
              >
                <span className="text-sm text-slate-900">
                  {user.firstName} {user.lastName}
                </span>
                <button onClick={() => onRemove(user.id)} className="hover:text-red-600 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
