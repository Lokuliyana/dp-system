"use client";

import { useState } from "react";
import {
  LayoutController,
  VerticalToolbar,
  MainMenu,
  MainMenuTitle,
  MainMenuItem,
  HorizontalToolbar,
  HorizontalToolbarTitle,
} from "@/components/layout/dynamic";
import { Button } from "@/components/ui/button";
import {
  IdCard,
  Shield,
  Activity,
  KeyRound,
  Save,
  Users,
  LayoutDashboard,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { useGetUserById, User } from "@/hooks/use-users-mock";
import { UserForm } from "./user-form";
import { Separator } from "@/components/ui/separator";

enum UserMenus {
  BASIC_DETAILS = "BASIC_DETAILS",
  ACCESS_PERMISSIONS = "ACCESS_PERMISSIONS",
  ACTIVITY = "ACTIVITY",
  RESET_PASSWORD = "RESET_PASSWORD",
}

export function UserDetailsView({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [currentMenu, setCurrentMenu] = useState<UserMenus>(UserMenus.BASIC_DETAILS);
  const { data: userDetails, isLoading } = useGetUserById(userId);

  const user = userDetails?.data;

  if (isLoading || !user) {
    return <div className="p-8 text-center">Loading user details...</div>;
  }

  return (
    <LayoutController showMainMenu showHorizontalToolbar showVerticalToolbar>
       {/* 1. Sidebar Menu (Same as List View for consistency) */}
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <HorizontalToolbarTitle>{user.name}</HorizontalToolbarTitle>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm text-muted-foreground">{user.email}</span>
           <Separator orientation="vertical" className="h-4" />
           <span className="text-sm font-medium">{user.role?.name}</span>
        </div>
      </HorizontalToolbar>

      {/* 3. Vertical Toolbar (Navigation for Details) */}
      <VerticalToolbar>
        <Button
          variant={currentMenu === UserMenus.BASIC_DETAILS ? "default" : "ghost"}
          size="icon"
          onClick={() => setCurrentMenu(UserMenus.BASIC_DETAILS)}
          title="Basic Details"
        >
          <IdCard className="h-4 w-4" />
        </Button>
        <Button
          variant={currentMenu === UserMenus.ACCESS_PERMISSIONS ? "default" : "ghost"}
          size="icon"
          onClick={() => setCurrentMenu(UserMenus.ACCESS_PERMISSIONS)}
          title="Access Permissions"
        >
          <Shield className="h-4 w-4" />
        </Button>
        <Button
          variant={currentMenu === UserMenus.ACTIVITY ? "default" : "ghost"}
          size="icon"
          onClick={() => setCurrentMenu(UserMenus.ACTIVITY)}
          title="Activity"
        >
          <Activity className="h-4 w-4" />
        </Button>
        <Button
          variant={currentMenu === UserMenus.RESET_PASSWORD ? "default" : "ghost"}
          size="icon"
          onClick={() => setCurrentMenu(UserMenus.RESET_PASSWORD)}
          title="Reset Password"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
      </VerticalToolbar>

      {/* 4. Main Content */}
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold tracking-tight">
            {currentMenu === UserMenus.BASIC_DETAILS && "Basic Details"}
            {currentMenu === UserMenus.ACCESS_PERMISSIONS && "Access Permissions"}
            {currentMenu === UserMenus.ACTIVITY && "Activity Log"}
            {currentMenu === UserMenus.RESET_PASSWORD && "Reset Password"}
          </h2>
          <p className="text-muted-foreground">
            Manage {currentMenu.toLowerCase().replace("_", " ")} for this user.
          </p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {currentMenu === UserMenus.BASIC_DETAILS && (
            <UserForm dataObject={user} />
          )}
          
          {currentMenu === UserMenus.ACCESS_PERMISSIONS && (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Permissions management interface would go here.</p>
            </div>
          )}

          {currentMenu === UserMenus.ACTIVITY && (
             <div className="space-y-4">
               {[1, 2, 3].map((i) => (
                 <div key={i} className="flex items-start gap-4 pb-4 border-b last:border-0">
                   <div className="h-2 w-2 mt-2 rounded-full bg-blue-500" />
                   <div>
                     <p className="text-sm font-medium">User logged in</p>
                     <p className="text-xs text-muted-foreground">2 hours ago</p>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
      </div>
    </LayoutController>
  );
}
