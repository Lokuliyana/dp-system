"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrentUser } from "@/hooks/useAuth";
import { LogOut, User, Settings, Shield } from "lucide-react";

export function UserNav() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("me");
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />
    );
  }

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const teacher = (user as any).teacherId;
  const staffRole = teacher?.roleIds?.[0]?.nameEn || "Staff Member";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-white shadow-sm hover:ring-4 hover:ring-primary/10 transition-all p-0 overflow-hidden">
          <Avatar className="h-full w-full">
            <AvatarImage src="" alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-blue-500/20 text-primary font-bold">
                {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-bold leading-none text-slate-900">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground font-medium mt-1">
              {user.email || user.phone}
            </p>
            {user.teacherId && (
                <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-wider border border-primary/20">
                        {staffRole}
                    </span>
                </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer gap-2 py-2.5">
            <User className="h-4 w-4 text-slate-500" />
            <span>Profile Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2 py-2.5">
            <Shield className="h-4 w-4 text-slate-500" />
            <span>Security Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer gap-2 py-2.5">
            <Settings className="h-4 w-4 text-slate-500" />
            <span>Preferences</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
            className="cursor-pointer gap-2 py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50"
            onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-bold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
