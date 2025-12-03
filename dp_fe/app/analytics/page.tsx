"use client"

import { useAppData } from "@/hooks"
import { AnalyticsService } from "@/services/analytics-service"
import { AttendanceService } from "@/services/attendance-service"
import { MarksService } from "@/services/marks-service"
import { StudentService } from "@/services/student-service(old)"
import { PageHeader, PageContainer } from "@/components/reusable"
import { StatsGrid } from "@/components/analytics"
import { StudentMetricsCard } from "@/components/analytics"
import { StudentsListCard } from "@/components/analytics"
import { PerformanceOverview } from "@/components/analytics"
import { InsightsSection } from "@/components/analytics"
import { Users, TrendingUp, TrendingDown, Activity, Award, AlertCircle } from 'lucide-react'
import { Loader } from 'lucide-react'

export default function AnalyticsPage() {
  const { grades, students, attendanceRecords, marks, isLoading, error } = useAppData()

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (error) {
    return (
      <PageContainer>
        <div className="text-center text-red-600">Error: {error}</div>
      </PageContainer>
    )
  }

  // Calculate metrics using services
  const metrics = AnalyticsService.generateMetrics(students, attendanceRecords, marks)
  const performanceDistribution = AnalyticsService.getPerformanceDistribution(students)
  const topPerformers = MarksService.getTopPerformers(students, marks, 5)
  const underperformers = MarksService.getUnderperformers(students, marks, 50, 5)
  const lowAttendanceStudents = AttendanceService.getStudentsWithLowAttendance(students, attendanceRecords, 75)
  const atRiskStudents = AnalyticsService.identifyAtRiskStudents(students, attendanceRecords, marks)

  const stats = [
    {
      id: "total-students",
      label: "Total Students",
      value: metrics.totalStudents,
      icon: <Users className="h-6 w-6" />,
      color: "blue" as const,
    },
    {
      id: "avg-attendance",
      label: "Average Attendance",
      value: `${metrics.averageClassAttendance}%`,
      icon: <Activity className="h-6 w-6" />,
      color: "green" as const,
    },
    {
      id: "avg-marks",
      label: "Average Class Marks",
      value: `${metrics.averageClassMarks}/100`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "purple" as const,
    },
    {
      id: "low-attendance",
      label: "Low Attendance",
      value: metrics.lowAttendanceStudents,
      subValue: `Below 75%`,
      icon: <AlertCircle className="h-6 w-6" />,
      color: "red" as const,
    },
  ]

  const performanceData = [
    {
      label: "Excellent",
      value: performanceDistribution.excellent,
      color: "#22c55e",
    },
    {
      label: "Good",
      value: performanceDistribution.good,
      color: "#3b82f6",
    },
    {
      label: "Average",
      value: performanceDistribution.average,
      color: "#f59e0b",
    },
    {
      label: "Needs Improvement",
      value: performanceDistribution["needs-improvement"],
      color: "#ef4444",
    },
  ]

  const topPerformersData = topPerformers.map((student) => ({
    id: student.id,
    name: StudentService.getStudentFullName(student),
    email: student.email,
    grade: student.gradeId,
    value: `${student.averageMarks}%`,
  }))

  const underperformersData = underperformers.map((student) => ({
    id: student.id,
    name: StudentService.getStudentFullName(student),
    email: student.email,
    grade: student.gradeId,
    value: `${student.averageMarks}%`,
  }))

  const lowAttendanceData = lowAttendanceStudents.slice(0, 5).map((student) => ({
    id: student.id,
    name: StudentService.getStudentFullName(student),
    email: student.email,
    grade: student.gradeId,
    value: `${AttendanceService.calculateAttendancePercentage(attendanceRecords, student.id)}%`,
  }))

  const insights = [
    {
      id: "top-performers",
      type: "success" as const,
      title: "High Achievers",
      description: `${topPerformers.length} students are performing excellently with marks above 80%.`,
    },
    {
      id: "low-attendance",
      type: "alert" as const,
      title: "Attendance Concern",
      description: `${lowAttendanceStudents.length} students have attendance below 75% threshold.`,
    },
    {
      id: "at-risk",
      type: "warning" as const,
      title: "At-Risk Students",
      description: `${atRiskStudents.length} students need support - both attendance and marks need improvement.`,
    },
    {
      id: "attendance-healthy",
      type: "info" as const,
      title: "Overall Attendance",
      description: `Class average attendance is ${metrics.averageClassAttendance}%, which is healthy.`,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics & Insights"
        description="Comprehensive school performance metrics and student analytics"
        icon={<Award className="h-6 w-6" />}
      />

      <PageContainer>
        <div className="space-y-8">
          {/* Key Stats */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Key Metrics</h2>
            <StatsGrid stats={stats} columns={4} />
          </section>

          {/* Performance Distribution */}
          <section>
            <PerformanceOverview
              title="Student Performance Distribution"
              description="Breakdown of students by academic performance level"
              icon={<TrendingUp className="h-5 w-5" />}
              data={performanceData}
            />
          </section>

          {/* Performance Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StudentMetricsCard
              title="Performance Levels"
              icon={<Award className="h-5 w-5 text-blue-600" />}
              metrics={[
                { label: "Excellent", value: metrics.excellentPerformers },
                { label: "Good", value: metrics.goodPerformers },
                { label: "Average", value: metrics.averagePerformers },
                { label: "Needs Support", value: metrics.needsImprovement },
              ]}
            />

            <StudentMetricsCard
              title="Attendance Overview"
              icon={<Activity className="h-5 w-5 text-green-600" />}
              metrics={[
                { label: "Class Average", value: `${metrics.averageClassAttendance}%` },
                { label: "Highest", value: `${metrics.topAttendancePercentage}%` },
                { label: "Lowest", value: `${metrics.lowestAttendancePercentage}%` },
                { label: "Low Attendance", value: metrics.lowAttendanceStudents },
              ]}
            />

            <StudentMetricsCard
              title="Academic Metrics"
              icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              metrics={[
                { label: "Average Marks", value: `${metrics.averageClassMarks}/100` },
                { label: "Top Performers", value: topPerformers.length },
                { label: "Need Support", value: underperformers.length },
                { label: "At Risk", value: atRiskStudents.length },
              ]}
            />
          </section>

          {/* Student Lists */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StudentsListCard
              title="Top Performers"
              description="Students with highest marks"
              icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              students={topPerformersData}
            />

            <StudentsListCard
              title="Underperformers"
              description="Students needing academic support"
              icon={<TrendingDown className="h-5 w-5 text-red-600" />}
              students={underperformersData}
            />
          </section>

          {/* Attendance List */}
          <section className="grid grid-cols-1">
            <StudentsListCard
              title="Low Attendance Alert"
              description="Students with attendance below 75%"
              icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
              students={lowAttendanceData}
              maxHeight="max-h-64"
            />
          </section>

          {/* Insights */}
          <section>
            <InsightsSection
              title="Insights & Recommendations"
              description="Key findings and actionable insights"
              insights={insights}
            />
          </section>
        </div>
      </PageContainer>
    </div>
  )
}
