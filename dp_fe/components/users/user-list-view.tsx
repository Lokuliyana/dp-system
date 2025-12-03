"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  LayoutController,
  HorizontalToolbar,
  HorizontalToolbarTitle,
  HorizontalToolbarIcons,
  MainMenu,
  MainMenuTitle,
  MainMenuItem,
} from "@/components/layout/dynamic";
import {
  Plus,
  Printer,
  RefreshCcw,
  Upload,
  Search,
  MoreVertical,
  Users,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { usePaginateUsers, useLiveSearchRoles, User } from "@/hooks/use-users-mock";
import { UserForm } from "./user-form";

export function UserListView() {
  const router = useRouter();
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [search, setSearch] = useState("");
  const [userRole, setUserRole] = useState("");

  const { data: userList, isLoading, refetch } = usePaginateUsers({
    currentPageIndex,
    dataPerPage: 20,
    search,
    role: userRole,
  });

  const { data: roles } = useLiveSearchRoles();

  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      {/* 1. Sidebar Menu */}
      <MainMenu>
        <MainMenuTitle>Management</MainMenuTitle>
        <MainMenuItem
          items={[
            {
              text: "Dashboard",
              icon: <LayoutDashboard className="h-4 w-4" />,
              href: "#",
            },
            {
              text: "Users",
              icon: <Users className="h-4 w-4" />,
              href: "#",
              subMenus: [
                { text: "All Users", href: "#" },
                { text: "Roles", href: "#" },
                { text: "Permissions", href: "#" },
              ],
            },
            {
              text: "Settings",
              icon: <Settings className="h-4 w-4" />,
              href: "#",
            },
          ]}
        />
      </MainMenu>

      {/* 2. Top Toolbar */}
      <HorizontalToolbar>
        <HorizontalToolbarTitle>User List</HorizontalToolbarTitle>
        <HorizontalToolbarIcons>
          <Button variant="ghost" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Upload className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New User
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96" align="end">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">New User</h4>
                <p className="text-sm text-muted-foreground">
                  Quickly create a new user
                </p>
                <UserForm />
              </div>
            </PopoverContent>
          </Popover>
        </HorizontalToolbarIcons>
      </HorizontalToolbar>

      {/* 3. Main Content */}
      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : userList?.data?.length ? (
                userList.data.map((user) => (
                  <TableRow
                    key={user._id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => router.push(`/playground/layout-test?userId=${user._id}`)}
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role?.name || "-"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // View details logic
                          }}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </LayoutController>
  );
}
