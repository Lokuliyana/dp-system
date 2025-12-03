"use client";

import { History } from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import {
  LayoutController,
  DynamicPageHeader,
} from "@/components/layout/dynamic";
import { HouseMeetsMenu } from "@/components/house-meets/house-meets-menu";

export default function HouseHistoryPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <HouseMeetsMenu />

      <DynamicPageHeader
        title="History & Archives"
        subtitle="View past house meet records and statistics."
        icon={History}
      />

      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Historical data visualization coming soon.
          </CardContent>
        </Card>
      </div>
    </LayoutController>
  );
}
