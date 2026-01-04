"use client";

import { InnerLayout, MainMenu, MainMenuTitle, MainMenuItem } from "@/components/layout/dynamic";
import { Users, Shield, Key } from "lucide-react";
import { usePathname } from "next/navigation";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <InnerLayout>
      <MainMenu>
        <MainMenuTitle>User Management</MainMenuTitle>
        <MainMenuItem
          items={[
            {
              text: "All Users",
              icon: <Users className="h-4 w-4" />,
              href: "/users",
              active: pathname === "/users",
            },
            {
              text: "System Roles",
              icon: <Shield className="h-4 w-4" />,
              href: "/users/roles",
              active: pathname === "/users/roles",
            },
          ]}
        />
      </MainMenu>
      {children}
    </InnerLayout>
  );
}
