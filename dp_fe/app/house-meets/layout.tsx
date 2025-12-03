"use client";

import { InnerLayout } from "@/components/layout/dynamic";

export default function HouseMeetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
