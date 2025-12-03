"use client";

import { InnerLayout } from "@/components/layout/dynamic";

export default function ActivitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
