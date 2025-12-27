"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from "recharts"
import { TrendingUp, Award, AlertTriangle, Users, Target, Zap } from "lucide-react"
import { Badge } from "@/components/ui"
import type { Student } from "@/lib/school-data"
import { GRADES } from "@/lib/school-data"

interface EnhancedAnalyticsDashboardProps {
  students: Student[]
}

export function EnhancedAnalyticsDashboard({ students }: EnhancedAnalyticsDashboardProps) {
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null)

  // Filter students by grade if selected
  const dashboardStudents = selectedGrade ? students.filter((s) => s.gradeId === selectedGrade) : students

  // ========== ATTENDANCE ANALYTICS ==========
  // Simulated attendance data for each student
  const studentAttendanceData = dashboardStudents.map((s) => {
    const attendanceRate = Math.floor(50 + Math.random() * 50) // 50-100%
    return {
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      rollNumber: s.admissionNumber,
      grade: GRADES.find((g) => g.id === s.gradeId)?.name || "Unknown",
      attendance: attendanceRate,
      risk: attendanceRate < 75 ? "high" : attendanceRate < 85 ? "medium" : "low",
    }
  })

  const lowAttendanceStudents = studentAttendanceData
    .filter((s) => s.attendance < 75)
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 10)

  const attendanceRiskSummary = {
    high: studentAttendanceData.filter((s) => s.attendance < 75).length,
    medium: studentAttendanceData.filter((s) => s.attendance >= 75 && s.attendance < 85).length,
    low: studentAttendanceData.filter((s) => s.attendance >= 85).length,
  }

  const attendanceByGrade = GRADES.map((grade) => {
    const gradeStudents = studentAttendanceData.filter((s) => s.grade === grade.name)
    const avgAttendance =
      gradeStudents.length > 0
        ? Math.round(gradeStudents.reduce((sum, s) => sum + s.attendance, 0) / gradeStudents.length)
        : 0
    return {
      grade: grade.name,
      attendance: avgAttendance,
      students: gradeStudents.length,
    }
  })

  // ========== TOP PERFORMERS ==========
  const topPerformers = dashboardStudents
    .filter((s) => s.academicPerformance === "excellent")
    .sort((a, b) => (b.talents?.length || 0) - (a.talents?.length || 0))
    .slice(0, 10)

  const performanceByGrade = GRADES.map((grade) => {
    const gradeStudents = dashboardStudents.filter((s) => s.gradeId === grade.id)
    return {
      grade: grade.name,
      excellent: gradeStudents.filter((s) => s.academicPerformance === "excellent").length,
      good: gradeStudents.filter((s) => s.academicPerformance === "good").length,
      average: gradeStudents.filter((s) => s.academicPerformance === "average").length,
      needsImprovement: gradeStudents.filter((s) => s.academicPerformance === "needs-improvement").length,
    }
  })

  // ========== TALENT & ACHIEVEMENTS ==========
  const talentStats = {
    academic: dashboardStudents.filter((s) => s.talents?.some((t) => t.category === "academic")).length,
    sports: dashboardStudents.filter((s) => s.talents?.some((t) => t.category === "sports")).length,
    arts: dashboardStudents.filter((s) => s.talents?.some((t) => t.category === "arts")).length,
    leadership: dashboardStudents.filter((s) => s.talents?.some((t) => t.category === "leadership")).length,
    other: dashboardStudents.filter((s) => s.talents?.some((t) => t.category === "other")).length,
  }

  const talentChartData = [
    { name: "Academic", value: talentStats.academic, fill: "#3b82f6" },
    { name: "Sports", value: talentStats.sports, fill: "#ef4444" },
    { name: "Arts", value: talentStats.arts, fill: "#f59e0b" },
    { name: "Leadership", value: talentStats.leadership, fill: "#10b981" },
    { name: "Other", value: talentStats.other, fill: "#8b5cf6" },
  ]

  const topTalentedStudents = dashboardStudents
    .map((s) => ({
      name: `${s.firstName} ${s.lastName}`,
      talents: s.talents?.length || 0,
      performance: s.academicPerformance,
      grade: GRADES.find((g) => g.id === s.gradeId)?.name || "Unknown",
    }))
    .filter((s) => s.talents > 0)
    .sort((a, b) => b.talents - a.talents)
    .slice(0, 8)

  // ========== OVERALL STATISTICS ==========
  const overallStats = {
    totalStudents: dashboardStudents.length,
    excellentCount: dashboardStudents.filter((s) => s.academicPerformance === "excellent").length,
    goodCount: dashboardStudents.filter((s) => s.academicPerformance === "good").length,
    averageCount: dashboardStudents.filter((s) => s.academicPerformance === "average").length,
    needsImprovementCount: dashboardStudents.filter((s) => s.academicPerformance === "needs-improvement").length,
    talentedStudents: dashboardStudents.filter((s) => (s.talents?.length || 0) > 0).length,
    avgAttendance: Math.round(
      studentAttendanceData.reduce((sum, s) => sum + s.attendance, 0) / studentAttendanceData.length,
    ),
  }

  return (
    <div className="space-y-8">
      {/* Header and Grade Filter */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Analytics & Insights</h1>
          <p className="text-slate-600 mt-2">Comprehensive school performance metrics and student analytics</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedGrade(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
              selectedGrade === null ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            All Grades
          </button>
          {GRADES.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedGrade === grade.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {grade.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-slate-900">{overallStats.totalStudents}</p>
              </div>
              <Users className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Excellent Performance</p>
                <p className="text-3xl font-bold text-green-600">{overallStats.excellentCount}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((overallStats.excellentCount / overallStats.totalStudents) * 100)}%
                </p>
              </div>
              <Award className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Attendance</p>
                <p
                  className={`text-3xl font-bold ${overallStats.avgAttendance >= 80 ? "text-blue-600" : "text-orange-600"}`}
                >
                  {overallStats.avgAttendance}%
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">With Talents</p>
                <p className="text-3xl font-bold text-purple-600">{overallStats.talentedStudents}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {Math.round((overallStats.talentedStudents / overallStats.totalStudents) * 100)}%
                </p>
              </div>
              <Zap className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="talents">Talents</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* ========== ATTENDANCE TAB ========== */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Attendance Risk Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="text-sm font-medium text-red-700">High Risk</p>
                    <p className="text-xs text-red-600">{"<75% attendance"}</p>
                  </div>
                  <p className="text-2xl font-bold text-red-600">{attendanceRiskSummary.high}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <p className="text-sm font-medium text-orange-700">Medium Risk</p>
                    <p className="text-xs text-orange-600">75-85% attendance</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{attendanceRiskSummary.medium}</p>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-700">Good</p>
                    <p className="text-xs text-green-600">{">85% attendance"}</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{attendanceRiskSummary.low}</p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance by Grade Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Attendance by Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={attendanceByGrade}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" angle={-45} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="attendance" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Low Attendance Students Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Students with Low Attendance (Need Follow-up)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lowAttendanceStudents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">All students have good attendance!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Student Name</th>
                        <th className="px-4 py-3 text-center font-semibold">Grade</th>
                        <th className="px-4 py-3 text-center font-semibold">Admission No</th>
                        <th className="px-4 py-3 text-center font-semibold">Attendance %</th>
                        <th className="px-4 py-3 text-center font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowAttendanceStudents.map((student, idx) => (
                        <tr key={student.id} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{student.grade}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{student.rollNumber}</td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`font-bold ${student.attendance < 60 ? "text-red-600" : "text-orange-600"}`}
                            >
                              {student.attendance}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              variant="destructive"
                              className={student.attendance < 60 ? "bg-red-600" : "bg-orange-600"}
                            >
                              {student.attendance < 60 ? "Critical" : "Warning"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== PERFORMANCE TAB ========== */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Performance Summary Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Excellent</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded h-2">
                      <div
                        className="bg-green-600 h-2 rounded"
                        style={{
                          width: `${(overallStats.excellentCount / overallStats.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-green-600">{overallStats.excellentCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Good</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded h-2">
                      <div
                        className="bg-blue-600 h-2 rounded"
                        style={{
                          width: `${(overallStats.goodCount / overallStats.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-blue-600">{overallStats.goodCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Average</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded h-2">
                      <div
                        className="bg-amber-600 h-2 rounded"
                        style={{
                          width: `${(overallStats.averageCount / overallStats.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-amber-600">{overallStats.averageCount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Needs Improvement</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-200 rounded h-2">
                      <div
                        className="bg-red-600 h-2 rounded"
                        style={{
                          width: `${(overallStats.needsImprovementCount / overallStats.totalStudents) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold text-red-600">{overallStats.needsImprovementCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Pie Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Excellent", value: overallStats.excellentCount, fill: "#10b981" },
                        { name: "Good", value: overallStats.goodCount, fill: "#3b82f6" },
                        { name: "Average", value: overallStats.averageCount, fill: "#f59e0b" },
                        { name: "Needs Improvement", value: overallStats.needsImprovementCount, fill: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {[{ fill: "#10b981" }, { fill: "#3b82f6" }, { fill: "#f59e0b" }, { fill: "#ef4444" }].map(
                        (entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance by Grade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={performanceByGrade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="excellent" fill="#10b981" name="Excellent" />
                  <Bar dataKey="good" fill="#3b82f6" name="Good" />
                  <Bar dataKey="average" fill="#f59e0b" name="Average" />
                  <Bar dataKey="needsImprovement" fill="#ef4444" name="Needs Improvement" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-green-600" />
                Top Performing Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformers.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No excellent performers in selected filter</p>
              ) : (
                <div className="space-y-3">
                  {topPerformers.map((student, idx) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-green-700 bg-green-200 px-2 py-1 rounded">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          {GRADES.find((g) => g.id === student.gradeId)?.name} • Talents: {student.talents?.length || 0}
                        </p>
                      </div>
                      <Badge className="bg-green-600">Excellent</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TALENTS TAB ========== */}
        <TabsContent value="talents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Talents Distribution Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Talents by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={talentChartData.filter((d) => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {talentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Talent Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Talent Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">Academic</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">{talentStats.academic}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {Math.round((talentStats.academic / overallStats.totalStudents) * 100)}% of students
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">Sports</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">{talentStats.sports}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {Math.round((talentStats.sports / overallStats.totalStudents) * 100)}% of students
                  </p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-700">Arts</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{talentStats.arts}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {Math.round((talentStats.arts / overallStats.totalStudents) * 100)}% of students
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">Leadership</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{talentStats.leadership}</p>
                  <p className="text-xs text-green-600 mt-1">
                    {Math.round((talentStats.leadership / overallStats.totalStudents) * 100)}% of students
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Most Talented Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-purple-600" />
                Most Talented Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topTalentedStudents.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No talented students recorded yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Student</th>
                        <th className="px-4 py-3 text-center font-semibold">Grade</th>
                        <th className="px-4 py-3 text-center font-semibold">Talents</th>
                        <th className="px-4 py-3 text-center font-semibold">Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTalentedStudents.map((student) => (
                        <tr key={student.name} className="border-b hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{student.name}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{student.grade}</td>
                          <td className="px-4 py-3 text-center">
                            <Badge className="bg-purple-600">{student.talents}</Badge>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge
                              className={
                                student.performance === "excellent"
                                  ? "bg-green-600"
                                  : student.performance === "good"
                                    ? "bg-blue-600"
                                    : student.performance === "average"
                                      ? "bg-amber-600"
                                      : "bg-red-600"
                              }
                            >
                              {student.performance}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== TRENDS TAB ========== */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance vs Attendance Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="attendance" name="Attendance %" domain={[0, 100]} />
                  <YAxis dataKey="performance" name="Performance" type="number" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Legend />
                  <Scatter
                    name="Excellent"
                    data={studentAttendanceData.map((s, i) => ({
                      attendance: s.attendance,
                      performance:
                        dashboardStudents[i]?.academicPerformance === "excellent"
                          ? 4
                          : dashboardStudents[i]?.academicPerformance === "good"
                            ? 3
                            : dashboardStudents[i]?.academicPerformance === "average"
                              ? 2
                              : 1,
                    }))}
                    fill="#10b981"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grade Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceByGrade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" angle={-45} textAnchor="end" height={70} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="excellent" stroke="#10b981" name="Excellent" />
                  <Line type="monotone" dataKey="good" stroke="#3b82f6" name="Good" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== INSIGHTS TAB ========== */}
        <TabsContent value="insights" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Key Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <h4 className="font-semibold text-slate-900 mb-2">Attendance Focus Areas</h4>
                <p className="text-sm text-slate-700">
                  {attendanceRiskSummary.high > 0
                    ? `${attendanceRiskSummary.high} students have critical attendance below 75%. Immediate intervention and parent communication recommended.`
                    : "Good attendance across the board. Continue monitoring."}
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-green-100">
                <h4 className="font-semibold text-slate-900 mb-2">Academic Excellence</h4>
                <p className="text-sm text-slate-700">
                  {Math.round((overallStats.excellentCount / overallStats.totalStudents) * 100)}% of students are
                  performing excellently. Consider peer mentoring programs to support students needing improvement.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-purple-100">
                <h4 className="font-semibold text-slate-900 mb-2">Talent Development</h4>
                <p className="text-sm text-slate-700">
                  {overallStats.talentedStudents} students have recorded talents. Ensure adequate support and
                  opportunities for further skill development across all categories.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-amber-100">
                <h4 className="font-semibold text-slate-900 mb-2">Students Needing Support</h4>
                <p className="text-sm text-slate-700">
                  {overallStats.needsImprovementCount} students need academic improvement. Personalized support plans
                  and tutoring sessions recommended.
                </p>
              </div>

              <div className="p-4 bg-white rounded-lg border border-rose-100">
                <h4 className="font-semibold text-slate-900 mb-2">Follow-up Actions</h4>
                <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside">
                  <li>
                    Schedule parent conferences for {attendanceRiskSummary.high + attendanceRiskSummary.medium} at-risk
                    students
                  </li>
                  <li>Establish mentorship pairs with top performers</li>
                  <li>Plan talent showcase events to celebrate student achievements</li>
                  <li>Review curriculum effectiveness for &quot;Needs Improvement&quot; group</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
