"use client";

import { DistrictOverview } from "@/components/district/overview";
import { PageContainer } from "@/components/reusable";

export default function DistrictPage() {
  return (
    <PageContainer variant="fluid">
      <DistrictOverview />
    </PageContainer>
  );
}
