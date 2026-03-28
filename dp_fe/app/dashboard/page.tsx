"use client";

import { PageContainer, ImprovedDashboard } from "@/components/reusable";

export default function DashboardPage() {
  return (
    <PageContainer variant="fluid" className="h-full p-0 flex flex-col">
      <ImprovedDashboard />
    </PageContainer>
  );
}
