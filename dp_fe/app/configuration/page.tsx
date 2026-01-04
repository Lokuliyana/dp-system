"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Settings, Database, Server, Users } from "lucide-react";

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">System Overview</h2>
        <p className="text-sm text-slate-500">
          Current system status and configuration metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Version</CardTitle>
            <Settings className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v2.0.0</div>
            <p className="text-xs text-slate-500">Latest stable release</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Status</CardTitle>
            <Database className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-slate-500">Connected to primary node</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Latency</CardTitle>
            <Server className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24ms</div>
            <p className="text-xs text-slate-500">Average response time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Other configuration modules can go here */}
      </div>
    </div>
  );
}
