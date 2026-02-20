"use client"

import { useState, useMemo } from "react"
import { useAppUsers, useRoles, useDeleteAppUser } from "@/hooks/useAuth"
import { 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Avatar,
  AvatarFallback,
} from "@/components/ui"
import { Plus, Search, Shield, Users, Filter, ArrowRight, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic"
import { useRouter } from "next/navigation"
import { DeleteConfirmationModal } from "@/components/reusable"

export default function UsersPage() {
  const router = useRouter()
  const { data: users, isLoading } = useAppUsers()
  const { data: roles } = useRoles()
  const deleteUser = useDeleteAppUser()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users?.filter(u => 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [users, searchTerm])

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <DynamicPageHeader
        title="User Management"
        subtitle="Manage system access, define roles, and configure granular permissions."
        icon={Users}
        actions={[
          {
            type: "search",
            props: {
              value: searchTerm,
              onChange: setSearchTerm,
              placeholder: "Search users...",
            },
          },
          {
            type: "button",
            props: {
              variant: "default",
              icon: Plus,
              children: "Add User",
              onClick: () => router.push("/users/create"),
            },
          },
        ]}
      />

      <div className="p-4 sm:p-6 space-y-6">


        {/* Main Content */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              System Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">User Profile</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading users...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                          No users found.
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers?.map((user) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={user.id}
                        className="group hover:bg-slate-50/50 cursor-pointer"
                        onClick={() => router.push(`/users/${user.id}/edit`)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[10px] font-bold">
                                {user.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{user.name}</span>
                              <span className="text-[10px] text-slate-500">{user.email || user.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {/* System Roles */}
                            {(user.roleIds || []).map(rid => {
                              const role = typeof rid === 'object' ? rid : roles?.find(r => r.id === rid);
                              return (
                                <Badge 
                                  key={typeof rid === 'object' ? rid.id : rid} 
                                  variant="default"
                                  className="text-[9px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20"
                                >
                                  {role?.name || "Unknown"}
                                </Badge>
                              );
                            })}
                            {/* Staff Roles */}
                            {typeof user.teacherId === 'object' && (user.teacherId as any).roleIds?.map((role: any) => (
                              <Badge 
                                key={role._id || role.id} 
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600"
                              >
                                {role.name || role.nameEn}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.isActive ? "default" : "secondary"}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-slate-500">
                            {user.permissions?.length || 0} Custom
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                setUserIdToDelete(user.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                            </Button>
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmationModal
        isOpen={!!userIdToDelete}
        onClose={() => setUserIdToDelete(null)}
        onConfirm={() => userIdToDelete && deleteUser.mutate(userIdToDelete, { onSuccess: () => setUserIdToDelete(null) })}
        itemName="this user"
        isLoading={deleteUser.isPending}
      />
    </LayoutController>
  )
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
