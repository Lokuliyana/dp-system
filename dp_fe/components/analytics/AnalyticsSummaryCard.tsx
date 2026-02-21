"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AnalyticsDistribution } from "@/services/analytics.service"

interface AnalyticsSummaryCardProps {
  distribution: AnalyticsDistribution;
  totalStudents: number;
  title?: string;
}

export function AnalyticsSummaryCard({ distribution, totalStudents, title = "Performance Distribution" }: AnalyticsSummaryCardProps) {
  const categories = [
    { label: "Best", value: distribution.best, color: "bg-green-600", textColor: "text-green-600" },
    { label: "Good", value: distribution.good, color: "bg-blue-600", textColor: "text-blue-600" },
    { label: "Normal", value: distribution.normal, color: "bg-yellow-600", textColor: "text-yellow-600" },
    { label: "Weak", value: distribution.weak, color: "bg-red-600", textColor: "text-red-600" },
  ];

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-end mb-2">
          <div className="text-4xl font-extrabold">{totalStudents}</div>
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Students</div>
        </div>
        
        <div className="space-y-4">
          {categories.map((cat) => {
            const percentage = totalStudents > 0 ? (cat.value / totalStudents) * 100 : 0;
            return (
              <div key={cat.label} className="space-y-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className={cat.textColor}>{cat.label}</span>
                  <span>{cat.value} ({percentage.toFixed(1)}%)</span>
                </div>
                <Progress value={percentage} className="h-2" indicatorClassName={cat.color} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
