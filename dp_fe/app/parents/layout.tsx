"use client";

import { InnerLayout } from "@/components/layout/dynamic";

export default function ParentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InnerLayout>{children}</InnerLayout>;
}
