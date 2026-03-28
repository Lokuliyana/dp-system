"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { AttendanceConfigPanel } from "@/components/configuration/attendance-config-panel";
import { Settings2 } from "lucide-react";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";

export default function AttendanceConfigurationPage() {
  return (
    <PageContainer>
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/configuration">Configuration</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Attendance Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <PageHeader 
        title="Attendance Settings" 
        description="Manage the global attendance marking window and restrictions"
        icon={<Settings2 className="h-6 w-6" />}
      />

      <div className="mt-8 max-w-4xl">
        <AttendanceConfigPanel />
      </div>
    </PageContainer>
  );
}
