"use client"

import { useAppData } from "@/hooks"
import { PageHeader } from "@/components/layout"
import { PageContainer } from "@/components/layout"
import { PredictiveAlerts } from "@/components/analytics/predictive-alerts"
import { ComparativeAnalysis } from "@/components/analytics/comparative-analysis"
import { AdvancedFilters } from "@/components/analytics/advanced-filters"
import { ReportBuilder } from "@/components/analytics/report-builder"
import { useState } from "react"
import { Zap } from "lucide-react"
import { GRADES } from "@/lib/school-data"

interface FilterConfig {
  gradeId?: string
  performanceLevel?: string
  attendanceRange?: [number, number]
  talentCategory?: string
}

export default function EnhancedAnalyticsPage() {
  const { students, grades } = useAppData()
  const [activeFilters, setActiveFilters] = useState<FilterConfig>({})

  // Generate sample predictive alerts
  const predictiveAlerts = students
    .filter((s) => s.academicPerformance === "needs-improvement")
    .slice(0, 5)
    .map((student, idx) => ({
      id: `alert-${idx}`,
      studentName: `${student.firstName} ${student.lastName}`,
      riskLevel: idx === 0 ? ("critical" as const) : idx < 2 ? ("high" as const) : ("medium" as const),
      reason:
        idx === 0
          ? "Attendance below 60% and marks below 40"
          : idx < 2
            ? "Recent attendance drop detected"
            : "Marks declining in last two assessments",
      suggestedAction:
        idx === 0
          ? "Schedule parent meeting immediately"
          : idx < 2
            ? "Follow up on absence reasons"
            : "Provide additional tutoring support",
      timestamp: new Date().toISOString(),
    }))

  // Generate comparative analysis data
  const comparativeData = [
    { period: "Q1", studentAverage: 72, classAverage: 70, gradeAverage: 68 },
    { period: "Q2", studentAverage: 75, classAverage: 72, gradeAverage: 70 },
    { period: "Q3", studentAverage: 78, classAverage: 74, gradeAverage: 71 },
    { period: "Q4", studentAverage: 80, classAverage: 76, gradeAverage: 73 },
  ]

  const performanceLevels = ["Excellent", "Good", "Average", "Needs Improvement"]
  const talentCategories = ["Academic", "Sports", "Arts", "Leadership", "Other"]

  const handleGenerateReport = (reportId: string, format: string) => {
    console.log(`Generating report: ${reportId} in ${format} format`)
    // Implementation for report generation
  }

  return (
    <div>
      <PageHeader
        title="Advanced Analytics"
        description="Predictive insights, comparative analysis, and report generation"
        icon={<Zap className="h-6 w-6" />}
      />

      <PageContainer>
        <div className="space-y-8">
          {/* Filters Section */}
          <section>
            <AdvancedFilters
              onFiltersChange={setActiveFilters}
              grades={grades || GRADES}
              performanceLevels={performanceLevels}
              talentCategories={talentCategories}
            />
          </section>

          {/* Predictive Alerts */}
          <section>
            <PredictiveAlerts alerts={predictiveAlerts} />
          </section>

          {/* Comparative Analysis */}
          <section>
            <ComparativeAnalysis
              data={comparativeData}
              title="Performance Over Time"
              subtitle="Comparing student performance against class and grade averages"
            />
          </section>

          {/* Report Builder */}
          <section>
            <ReportBuilder onGenerateReport={handleGenerateReport} />
          </section>
        </div>
      </PageContainer>
    </div>
  )
}
