// app/layout.tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ReactQueryProvider } from "@/lib/react-query";

export const metadata: Metadata = {
  title: "EduMIS Admin",
  description: "School Management Admin Console",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50">
        <ReactQueryProvider>
          <AppShell>{children}</AppShell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
