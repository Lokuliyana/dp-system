"use client";

import { PageContainer } from "@/components/reusable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Trophy, Map, Medal, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ChampionsPage() {
  return (
    <PageContainer variant="fluid">
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/champions/zonal">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-500" />
                Zonal Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage zonal competitions, team selections, and results.
              </p>
              <div className="flex items-center text-sm font-medium text-blue-600">
                View Zonal Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/champions/district">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-purple-500" />
                District Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage district competitions, qualified teams, and standings.
              </p>
              <div className="flex items-center text-sm font-medium text-purple-600">
                View District Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/champions/all-island">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                All Island Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage national level competitions and final rankings.
              </p>
              <div className="flex items-center text-sm font-medium text-orange-600">
                View All Island Dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
