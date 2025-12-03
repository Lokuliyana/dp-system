"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Legacy export retained for compatibility.
 * Directs users to the live Prefects pages backed by real data.
 */
export function PrefectsManagement() {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 p-6">
        <div className="flex items-center gap-2 text-slate-700">
          <Shield className="h-5 w-5 text-blue-600" />
          <span className="font-semibold">Prefects management has moved.</span>
        </div>
        <p className="text-sm text-slate-600">
          Use the Prefects module to create years, positions, and appoint students with live data.
        </p>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/prefects">Open Prefects</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/prefects/positions">Manage Positions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
