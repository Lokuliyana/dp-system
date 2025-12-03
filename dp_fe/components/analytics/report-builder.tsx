"use client"

import { useState } from "react"
import { Button } from "@/components/ui"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Download, FileText, Mail } from "lucide-react"
import { Badge } from "@/components/ui"

interface ReportOption {
  id: string
  label: string
  description: string
  format: "pdf" | "excel" | "email"
}

interface ReportBuilderProps {
  onGenerateReport: (reportId: string, format: string) => void
}

const reportOptions: ReportOption[] = [
  {
    id: "attendance-summary",
    label: "Attendance Summary",
    description: "Monthly/quarterly attendance report",
    format: "pdf",
  },
  {
    id: "performance-report",
    label: "Academic Performance",
    description: "Marks and performance metrics by subject",
    format: "pdf",
  },
  {
    id: "at-risk-students",
    label: "At-Risk Students Report",
    description: "Students needing immediate intervention",
    format: "pdf",
  },
  {
    id: "talent-report",
    label: "Talent & Achievements",
    description: "Student talents and extracurricular participation",
    format: "pdf",
  },
  {
    id: "class-comparison",
    label: "Class Comparison Report",
    description: "Performance comparison across classes",
    format: "excel",
  },
]

export function ReportBuilder({ onGenerateReport }: ReportBuilderProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const toggleReport = (reportId: string) => {
    setSelectedReports((prev) => (prev.includes(reportId) ? prev.filter((id) => id !== reportId) : [...prev, reportId]))
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      for (const reportId of selectedReports) {
        const report = reportOptions.find((r) => r.id === reportId)
        if (report) {
          onGenerateReport(reportId, report.format)
        }
      }
      // Reset after generation
      setSelectedReports([])
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {reportOptions.map((report) => (
            <label key={report.id} className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedReports.includes(report.id)}
                onChange={() => toggleReport(report.id)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-sm text-slate-900">{report.label}</p>
                <p className="text-xs text-slate-600">{report.description}</p>
              </div>
              <Badge variant="outline">{report.format.toUpperCase()}</Badge>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleGenerateReport}
            disabled={selectedReports.length === 0 || isGenerating}
            className="flex-1 gap-2"
          >
            <Download className="h-4 w-4" />
            Generate ({selectedReports.length})
          </Button>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Mail className="h-4 w-4" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
