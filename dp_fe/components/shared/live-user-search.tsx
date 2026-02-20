"use client"

import { useState, useMemo } from "react"
import { X, Search, Check } from "lucide-react"
import { Input } from "@/components/ui"

export interface SearchableUser {
  id: string
  _id?: string
  firstName: string
  lastName: string
  fullNameSi?: string
  email?: string
  admissionNumber?: string
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
        const admission = user.admissionNumber?.toLowerCase() || ""
        return fullName.includes(term) || email.includes(term) || admission.includes(term)
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
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto overflow-x-hidden py-1">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleSelect(user)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    {user.fullNameSi && <p className="text-[11px] font-medium text-slate-500 mb-0.5">{user.fullNameSi}</p>}
                    {user.email && <p className="text-[10px] text-slate-500">{user.email}</p>}
                    <div className="flex items-center gap-2 mt-0.5">
                      {user.admissionNumber && (
                        <span className="text-[10px] font-bold text-primary bg-primary/5 px-1 rounded">
                          {user.admissionNumber}
                        </span>
                      )}
                      {user.gradeId && (
                        <p className="text-[10px] text-slate-400 font-medium">
                          {user.gradeId.replace("grade-", "Grade ")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && searchTerm.trim() && filteredUsers.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-6 text-center animate-in fade-in slide-in-from-top-2 duration-200">
            <Search className="h-6 w-6 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No matching students</p>
            <p className="text-[10px] text-slate-500 mt-1">Try a different name or ID</p>
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex flex-wrap gap-2">
            {selectedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-primary/5 border border-primary/10 rounded-lg px-2.5 py-1.5 flex items-center gap-2 group hover:bg-primary/10 transition-colors"
                title={`${user.firstName} ${user.lastName}`}
              >
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-900 leading-tight">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button 
                  onClick={() => onRemove(user.id)} 
                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-md hover:bg-white/50"
                  type="button"
                >
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
