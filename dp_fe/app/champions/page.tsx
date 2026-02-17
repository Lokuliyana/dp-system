"use client";

import { Trophy, Map, Medal, Globe, ArrowRight } from "lucide-react";
import { LayoutController, DynamicPageHeader } from "@/components/layout/dynamic";
import { ChampionsMenu } from "@/components/champions/champions-menu";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import Link from "next/link";

export default function ChampionsPage() {
  return (
    <LayoutController showMainMenu showHorizontalToolbar>
      <ChampionsMenu />

      <DynamicPageHeader
        title="Champions Dashboard"
        subtitle="Manage and track performance at Zonal, District, and All Island levels."
        icon={Trophy}
      />

      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-2">
                <Map className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Zonal Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
                Bridge house meet champions to inter-school zonal competitions.
              </p>
              <Link href="/champions/zonal">
                <Button variant="outline" className="w-full group">
                  Manage Zonal <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-2">
                <Medal className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-xl">District Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
                Qualification and results tracking for district-wide athletic events.
              </p>
              <Link href="/champions/district">
                <Button variant="outline" className="w-full group">
                  Manage District <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all border-slate-200">
            <CardHeader className="pb-2">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center mb-2">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <CardTitle className="text-xl">All Island</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-6 min-h-[40px]">
                Final stage for national level recognition and medal counting.
              </p>
              <Link href="/champions/all-island">
                <Button variant="outline" className="w-full group">
                  Manage All Island <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutController>
  );
}

